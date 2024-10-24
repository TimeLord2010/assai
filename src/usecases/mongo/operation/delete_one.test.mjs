import assert from 'node:assert'
import { describe, it } from 'node:test'
import { manageMockDatabase } from '../../../__test/manage_mock_database.mjs'
import { manageMockRegistry } from '../../../__test/manage_mock_registry.mjs'
import { mockGetCollection } from '../../../__test/mock_get_collection.mjs'
import { count } from './count.mjs'
import { deleteOne } from './delete_one.mjs'

describe('deleteOne', () => {

    manageMockDatabase()

    const { id } = manageMockRegistry({
        name: 'Made in heaven',
    }, {
        deleteAtEnd: false,
    })

    it('should succeed on deleting by using registered id', async () => {
        const deleted = await deleteOne({
            // @ts-ignore
            getCollection: mockGetCollection,
            query: { id }
        })
        assert(deleted)

        const docCount = await count({
            // @ts-ignore
            getCollection: mockGetCollection,
            query: { id }
        })
        assert(docCount == 0)
    })
})