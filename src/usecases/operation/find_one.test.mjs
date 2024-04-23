import assert from 'node:assert'
import { after, describe, it } from 'node:test'
import { manageMockRegistry } from '../../../test/manage_mock_registry.mjs'
import { mockGetCollection } from '../../../test/mock_get_collection.mjs'
import { closeMongoClient } from '../../mongo_client.mjs'
import { findOne } from './find_one.mjs'

describe('findOne', () => {

    const { id } = manageMockRegistry({
        name: 'Anna'
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

    it('should succeed at finding a saved document', async () => {
        const savedDoc = await _findOne({ id })
        assert(savedDoc)
        assert(savedDoc.id == id)
        assert(savedDoc.name == name)
    })
})