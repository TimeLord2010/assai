import { ObjectId } from 'mongodb'
import assert from 'node:assert'
import { before, describe, it } from 'node:test'
import { manageMockDatabase } from '../../../__test/manage_mock_database.mjs'
import { mockGetCollection } from '../../../__test/mock_get_collection.mjs'
import { generateNewId } from '../generate_new_id.mjs'
import { aggregate } from './aggregate.mjs'

describe('aggregate', () => {

    manageMockDatabase()

    const collectionName = 'aggregate_test_982340192'
    const getCollection = () => mockGetCollection(collectionName)

    const ids = [generateNewId(), generateNewId(), generateNewId()]

    before(async () => {
        const col = await getCollection()
        await col.insertMany([
            { _id: ObjectId.createFromHexString(ids[0]), name: 'Alice', score: 10, group: 'A' },
            { _id: ObjectId.createFromHexString(ids[1]), name: 'Bob', score: 20, group: 'A' },
            { _id: ObjectId.createFromHexString(ids[2]), name: 'Carol', score: 30, group: 'B' },
        ])
    })

    it('should return documents without _id and with id instead', async () => {
        const docs = await aggregate({
            // @ts-ignore
            getCollection,
            pipeline: [{ $match: {} }],
        })

        assert(docs.length > 0)
        for (const doc of docs) {
            assert(doc._id === undefined, 'document should not have _id property')
            assert(doc.id !== undefined, 'document should have id property')
        }
    })

    it('should return all documents when pipeline has no filters', async () => {
        const docs = await aggregate({
            // @ts-ignore
            getCollection,
            pipeline: [{ $match: {} }],
        })
        assert.equal(docs.length, 3)
    })

    it('should filter documents using $match with id', async () => {
        const docs = await aggregate({
            // @ts-ignore
            getCollection,
            pipeline: [{ $match: { id: ids[0] } }],
        })
        assert.equal(docs.length, 1)
        assert.equal(docs[0].id, ids[0])
        assert(docs[0]._id === undefined)
    })

    it('should filter documents using $match with _id', async () => {
        const docs = await aggregate({
            // @ts-ignore
            getCollection,
            pipeline: [{ $match: { _id: ids[1] } }],
        })
        assert.equal(docs.length, 1)
        assert.equal(docs[0].id, ids[1])
        assert(docs[0]._id === undefined)
    })

    it('should apply $project stage correctly', async () => {
        const docs = await aggregate({
            // @ts-ignore
            getCollection,
            pipeline: [
                { $match: {} },
                { $project: { name: 1 } },
            ],
        })
        assert(docs.length > 0)
        for (const doc of docs) {
            assert(doc._id === undefined, 'document should not have _id property')
            assert(doc.id !== undefined, 'document should have id property')
            assert(doc.name !== undefined, 'document should have name property')
            assert(doc.score === undefined, 'projected-out field should not be present')
        }
    })

    it('should apply $sort stage correctly', async () => {
        const docs = await aggregate({
            // @ts-ignore
            getCollection,
            pipeline: [
                { $match: {} },
                { $sort: { score: -1 } },
            ],
        })
        assert.equal(docs.length, 3)
        assert.equal(docs[0].name, 'Carol')
        assert.equal(docs[1].name, 'Bob')
        assert.equal(docs[2].name, 'Alice')
    })

    it('should apply $group stage and resulting documents have id as null', async () => {
        const docs = await aggregate({
            // @ts-ignore
            getCollection,
            pipeline: [
                { $group: { _id: null, total: { $sum: '$score' } } },
            ],
        })
        assert.equal(docs.length, 1)
        assert.equal(docs[0].total, 60)
        assert(docs[0]._id === undefined, 'document should not have _id property')
    })

    it('should apply $group stage grouped by field and resulting documents have id', async () => {
        const docs = await aggregate({
            // @ts-ignore
            getCollection,
            pipeline: [
                { $group: { _id: '$group', total: { $sum: '$score' } } },
                { $sort: { _id: 1 } },
            ],
        })
        assert.equal(docs.length, 2)
        for (const doc of docs) {
            assert(doc._id === undefined, 'document should not have _id property')
            assert(doc.id !== undefined, 'document should have id property')
        }
        assert.equal(docs[0].id, 'A')
        assert.equal(docs[0].total, 30)
        assert.equal(docs[1].id, 'B')
        assert.equal(docs[1].total, 30)
    })

    it('should apply $limit stage', async () => {
        const docs = await aggregate({
            // @ts-ignore
            getCollection,
            pipeline: [
                { $match: {} },
                { $limit: 2 },
            ],
        })
        assert.equal(docs.length, 2)
    })

    it('should not mutate the input pipeline', async () => {
        const pipeline = [{ $match: { id: ids[0] } }]
        const originalStage = { ...pipeline[0].$match }

        await aggregate({
            // @ts-ignore
            getCollection,
            pipeline,
        })

        assert(pipeline[0].$match.id != null, 'original id key should still be present')
        // @ts-ignore
        assert(pipeline[0].$match._id == null, 'pipeline should not have been mutated to add _id')
        assert.equal(pipeline[0].$match.id, originalStage.id)
    })
})
