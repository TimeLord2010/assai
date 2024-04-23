import { ObjectId } from 'mongodb'
import assert from 'node:assert'
import { after, describe, it } from 'node:test'
import { manageMockRegistry } from '../../../test/manage_mock_registry.mjs'
import { mockGetCollection } from '../../../test/mock_get_collection.mjs'
import { closeMongoClient } from '../../mongo_client.mjs'
import { generateNewId } from '../generate_new_id.mjs'
import { updateOne } from './update_one.mjs'

describe('updateOne', () => {

    const { id } = manageMockRegistry({
        name: 'Jolyne Cujoh',
    })

    after(() => {
        closeMongoClient()
    })

    it('should update document using string id', async () => {
        const updatedName = 'Jolyne'
        const updated = await updateOne({
            // @ts-ignore
            getCollection: mockGetCollection,
            query: {
                id,
            },
            update: {
                $set: { name: updatedName }
            },
        })
        assert(updated)
        const col = await mockGetCollection()
        const doc = await col.findOne({
            _id: new ObjectId(id)
        })
        assert(doc)
        assert(doc?.name == updatedName)
    })

    it('should not update any document using non registered id', async () => {
        const updated = await updateOne({
            // @ts-ignore
            getCollection: mockGetCollection,
            query: {
                id: generateNewId(),
            },
            update: {
                $set: {
                    createdAt: new Date()
                },
            },
        })
        assert(!updated)
    })
})