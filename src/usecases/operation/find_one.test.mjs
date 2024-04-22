import { ObjectId } from 'mongodb'
import assert from 'node:assert'
import { after, before, describe, it } from 'node:test'
import { mockGetCollection } from '../../../test/mock_get_collection.mjs'
import { closeMongoClient } from '../../mongo_client.mjs'
import { generateNewId } from '../generate_new_id.mjs'
import { findOne } from './find_one.mjs'

describe('findOne', () => {

    const id = generateNewId()
    const name = 'Anna'

    before(async () => {
        const col = await mockGetCollection()
        await col.insertOne({
            _id: new ObjectId(id),
            name,
        })
    })

    after(() => {
        closeMongoClient()
    })

    async function _findOne(query) {
        const r = await findOne({
            // @ts-ignore
            getCollection: mockGetCollection,
            query: query,
        })
        return r
    }

    it('should succeed on finding a saved document', async () => {
        const savedDoc = await _findOne({ id })
        assert(savedDoc)
        assert(savedDoc.id == id)
        assert(savedDoc.name == name)
    })
})