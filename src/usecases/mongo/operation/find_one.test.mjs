import assert from 'node:assert'
import { describe, it } from 'node:test'
import { generateNewId } from '../generate_new_id.mjs'
import { manageMockRegistry } from '../test/manage_mock_registry.mjs'
import { mockGetCollection } from '../test/mock_get_collection.mjs'
import { findOne } from './find_one.mjs'

describe('findOne', () => {

    const userId = generateNewId()
    const { id, name } = manageMockRegistry({
        name: 'Anna',
        posts: [
            {
                userId,
                type: 'adm'
            }
        ],
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
        assert.equal(savedDoc.id, id)
        assert.equal(savedDoc.name, name)
        const posts = savedDoc.posts
        assert.deepEqual(posts[0], {
            userId, type: 'adm'
        })
    })
})