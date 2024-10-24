import { fakerPT_BR } from '@faker-js/faker'
import assert from 'node:assert'
import { before, describe, it } from 'node:test'
import { manageMockDatabase } from '../../../__test/manage_mock_database.mjs'
import { mockGetCollection } from '../../../__test/mock_get_collection.mjs'
import { generateNewId } from '../generate_new_id.mjs'
import { count } from './count.mjs'
import { insertMany } from './insert_many.mjs'

describe('count', {
    timeout: 2000,
}, () => {
    manageMockDatabase()

    const tag = generateNewId()
    before(async () => {
        /** @type {import('../../../__test/mock_get_collection.mjs').ItestCollection[]} */
        const items = []
        for (let i = 0; i < 50; i++) {
            items.push({
                name: fakerPT_BR.person.fullName(),
                tag,
            })
        }
        await insertMany({
            docs: items,
            // @ts-ignore
            getCollection: mockGetCollection,
        })
    })

    it('should count all inserted documents', async () => {
        const counter = await count({
            query: { tag },
            // @ts-ignore
            getCollection: mockGetCollection,
        })
        assert.equal(counter, 50)
    })

    it('should return 0 if the query does not match any documents', async () => {
        const counter = await count({
            query: { tag: generateNewId() },
            // @ts-ignore
            getCollection: mockGetCollection,
        })
        assert.equal(counter, 0)
    })
})