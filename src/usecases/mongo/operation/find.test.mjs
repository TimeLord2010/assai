import { ObjectId } from 'mongodb'
import assert from 'node:assert'
import { before, describe, it } from 'node:test'
import { manageMockDatabase } from '../../../__test/manage_mock_database.mjs'
import { mockGetCollection } from '../../../__test/mock_get_collection.mjs'
import { find } from './find.mjs'

describe('find', () => {

    manageMockDatabase()

    const ids = [
        new ObjectId(),
        new ObjectId(),
    ]

    const getCollection = () => mockGetCollection('users_122039039')


    before(async () => {
        const col = await getCollection()

        await col.insertMany([
            {
                tag: ids[0],
                name: 'Brian Norris',
            }, {
                tag: ids[1],
                name: 'Glen Ray',
            }
        ])
    })

    it('should find all docs when no query is provided', async () => {
        const docs = await find({
            query: {},
            // @ts-ignore
            getCollection,
        })
        assert.equal(docs.length, 2)
    })

    it('should be able to limit the docs returned', async () => {
        const docs = await find({
            query: {},
            // @ts-ignore
            getCollection,
            options: {
                limit: 1,
            }
        })
        assert.equal(docs.length, 1)
    })

    it('should keep input ids as strings', async () => {
        const lookupIds = [...ids]
        const docs = await find({
            query: {
                tag: { $in: lookupIds }
            },
            // @ts-ignore
            getCollection,
        })
        assert.equal(docs.length, 2)
        assert.equal(typeof docs[0].tag, 'string')
        assert.equal(typeof docs[1].tag, 'string')
        assert.equal(docs[0].tag, lookupIds[0])
        assert.equal(docs[1].tag, lookupIds[1])
    })
})