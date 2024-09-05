import { fakerPT_BR } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import assert from 'node:assert'
import { describe, it } from 'node:test'
import { manageMockDatabase } from '../../../__test/manage_mock_database.mjs'
import { mockGetCollection } from '../../../__test/mock_get_collection.mjs'
import { generateNewId } from '../generate_new_id.mjs'
import { insertMany } from './insert_many.mjs'

describe('insertMany', () => {

    manageMockDatabase()

    it('should succeed at inserting multiple data', async () => {
        const tag = generateNewId()
        /** @type {import('../../../__test/mock_get_collection.mjs').ItestCollection[]} */
        const items = []
        for (let i = 0; i < 50; i++) {
            items.push({
                name: fakerPT_BR.person.fullName(),
                createdAt: fakerPT_BR.date.birthdate(),
                tag: tag,
            })
        }
        const r = await insertMany({
            docs: items,
            // @ts-ignore
            getCollection: mockGetCollection,
        })
        const ids = r.map(x => x.id)
        const allHaveId = ids.every(x => x && ObjectId.isValid(x))
        assert(allHaveId)

        const col = await mockGetCollection()

        const docs = await col.find({
            tag: ObjectId.createFromHexString(tag),
        }).toArray()
        assert(docs.length == items.length)

        const tagFound = docs[0].tag
        assert(tagFound instanceof ObjectId)
    })
})