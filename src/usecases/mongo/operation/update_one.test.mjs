import { ObjectId } from 'mongodb'
import assert from 'node:assert'
import { describe, it } from 'node:test'
import { manageMockDatabase } from '../../../__test/manage_mock_database.mjs'
import { manageMockRegistry } from '../../../__test/manage_mock_registry.mjs'
import { mockGetCollection } from '../../../__test/mock_get_collection.mjs'
import { generateNewId } from '../generate_new_id.mjs'
import { updateOne } from './update_one.mjs'

describe('updateOne', () => {

    manageMockDatabase()

    const { id } = manageMockRegistry({
        name: 'Jolyne Cujoh',
    })

    it('should update document using string id', async () => {
        const updatedName = 'Jolyne'
        const query = {
            id,
        }
        const updated = await updateOne({
            // @ts-ignore
            getCollection: mockGetCollection,
            query: query,
            update: {
                $set: { name: updatedName }
            },
        })
        assert(updated)

        // Checking if the update took effect
        const col = await mockGetCollection()
        const doc = await col.findOne({
            _id: new ObjectId(id)
        })
        assert(doc)
        assert(doc?.name == updatedName)

        // Checking if the query object changed
        assert(typeof query.id == 'string')
        assert(query._id === undefined)
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

    it('should not update arrays inside the query object', async () => {
        const ids = [generateNewId(), generateNewId()]
        const query = {
            id: { $in: ids },
        }
        const updated = await updateOne({
            // @ts-ignore
            getCollection: mockGetCollection,
            query: query,
            update: {
                $set: {
                    createdAt: new Date()
                },
            },
        })
        assert(!updated)

        // Checking if query object changed
        assert(query.id != null)
        assert(query._id === undefined)

        // Checking if ids array changed
        const areAllStrs = ids.every(x => typeof x == 'string')
        assert(areAllStrs)
    })
})