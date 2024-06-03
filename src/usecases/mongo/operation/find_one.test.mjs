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

        // Checking document integrity
        assert.equal(savedDoc.id, id)
        assert(savedDoc._id === undefined, 'Should not contain the _id property')
        assert.equal(savedDoc.name, name)
        const posts = savedDoc.posts
        assert.deepEqual(posts[0], {
            userId, type: 'adm'
        })

        // Checking if the keys are in the correct order
        const firstKey = Object.keys(savedDoc)[0]
        assert(firstKey == 'id', `id should be the first object key, but got ${firstKey}`)
    })

    it('should not change query object', async () => {
        const ids = [id]
        const query = {
            id: {
                $in: ids,
            }
        }

        // Making sure the query works
        const savedDoc = await _findOne(query)
        assert(savedDoc)
        assert.equal(savedDoc.name, name)

        // Checking if the query object has changed
        assert(query.id != null)
        assert(query._id == null)

        // Cheking if the ids array has changed
        const allIdsAreStrings = ids.every(x => typeof x == 'string')
        assert(allIdsAreStrings)


    })
})