import { ObjectId } from 'mongodb'
import assert from 'node:assert'
import { before, describe, it } from 'node:test'
import { manageMockDatabase } from '../../../__test/manage_mock_database.mjs'
import { manageMockRegistry } from '../../../__test/manage_mock_registry.mjs'
import { mockGetCollection } from '../../../__test/mock_get_collection.mjs'
import { generateNewId } from '../generate_new_id.mjs'
import { bulkWrite } from './bulk_write.mjs'
import { findOneAndUpdate } from './find_one_and_update.mjs'
import { updateMany } from './update_many.mjs'
import { updateOne } from './update_one.mjs'

/**
 * These tests guard against the bug where `options.arrayFilters` was passed to
 * the native driver without running through `stringsIntoId`, so a filter written
 * with a raw hex-string never matched the persisted `ObjectId`.
 *
 * The array subdocuments are added via `$push` (an update), which keeps the
 * `id` field name and converts the hex-string value into an `ObjectId` — exactly
 * the scenario described in the bug report.
 */
describe('arrayFilters hex-string conversion', () => {

    manageMockDatabase()

    // Post ids are hex-strings persisted as ObjectId, reproducing the scenario.
    const postAId = generateNewId()
    const postBId = generateNewId()

    const { id } = manageMockRegistry({ name: 'Jolyne Cujoh' })

    before(async () => {
        await updateOne({
            // @ts-ignore
            getCollection: mockGetCollection,
            query: { id },
            update: /** @type {any} */ ({
                $push: {
                    posts: {
                        $each: [
                            { id: postAId, title: 'a' },
                            { id: postBId, title: 'b' },
                        ],
                    },
                },
            }),
        })
    })

    /**
     * @param {string} postId
     * @returns {Promise<any>}
     */
    async function findPost(postId) {
        const col = await mockGetCollection()
        const doc = /** @type {any} */ (await col.findOne({ _id: ObjectId.createFromHexString(id) }))
        return doc?.posts?.find((/** @type {any} */ p) => p.id.equals(ObjectId.createFromHexString(postId)))
    }

    it('persists array subdocument ids as ObjectId (precondition)', async () => {
        const post = await findPost(postAId)
        assert(post)
        assert(post.id instanceof ObjectId)
    })

    it('updateOne updates the array element matched by hex-string id', async () => {
        const updated = await updateOne({
            // @ts-ignore
            getCollection: mockGetCollection,
            query: { id },
            update: { $set: { 'posts.$[elem].title': 'updated-one' } },
            options: { arrayFilters: [{ 'elem.id': postAId }] },
        })
        assert(updated)

        const post = await findPost(postAId)
        assert.equal(post?.title, 'updated-one')
    })

    it('updateMany updates the array element matched by hex-string id inside $in', async () => {
        const result = await updateMany({
            // @ts-ignore
            getCollection: mockGetCollection,
            query: { id },
            update: { $set: { 'posts.$[elem].title': 'updated-many' } },
            options: { arrayFilters: [{ 'elem.id': { $in: [postBId] } }] },
        })
        assert(result.modifiedCount > 0)

        const post = await findPost(postBId)
        assert.equal(post?.title, 'updated-many')
    })

    it('findOneAndUpdate updates the array element matched by hex-string id', async () => {
        const doc = await findOneAndUpdate({
            // @ts-ignore
            getCollection: mockGetCollection,
            query: { id },
            update: { $set: { 'posts.$[elem].title': 'updated-foau' } },
            options: { arrayFilters: [{ 'elem.id': postAId }], returnDocument: 'after' },
        })
        assert(doc)

        const post = await findPost(postAId)
        assert.equal(post?.title, 'updated-foau')
    })

    it('bulkWrite updateOne updates the array element matched by hex-string id', async () => {
        await bulkWrite({
            // @ts-ignore
            getCollection: mockGetCollection,
            operations: [
                {
                    updateOne: {
                        filter: { id },
                        update: { $set: { 'posts.$[elem].title': 'updated-bulk' } },
                        arrayFilters: [{ 'elem.id': postBId }],
                    },
                },
            ],
        })

        const post = await findPost(postBId)
        assert.equal(post?.title, 'updated-bulk')
    })
})
