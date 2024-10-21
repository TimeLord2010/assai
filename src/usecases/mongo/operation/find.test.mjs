import assert from 'node:assert'
import { before, describe, it } from 'node:test'
import { manageMockDatabase } from '../../../__test/manage_mock_database.mjs'
import { mockGetCollection } from '../../../__test/mock_get_collection.mjs'
import { find } from './find.mjs'

describe('find', () => {

    manageMockDatabase()

    before(async () => {
        const col = await mockGetCollection()
        await col.insertMany([
            {
                name: 'Brian Norris',
            }, {
                name: 'Glen Ray',
            }
        ])
    })

    it('should be able to limit the docs returned', async () => {
        const docs = await find({
            query: {},
            // @ts-ignore
            getCollection: mockGetCollection,
            options: {
                limit: 1,
            }
        })
        assert.equal(docs.length, 1)
    })
})