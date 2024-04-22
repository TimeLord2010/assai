import assert from 'node:assert'
import { describe, it } from 'node:test'
import { mockGetCollection } from '../../../test/mock_get_collection.mjs'
import { generateNewId } from '../generate_new_id.mjs'
import { findOne } from './find_one.mjs'
import { insertOne } from './insert_one.mjs'

describe('insertOne', () => {

    async function insert(doc) {
        await insertOne({
            doc, getCollection: mockGetCollection,
        })
    }

    it('should insert the desired data', async () => {
        const dt = new Date()
        await insert({
            name: 'vini',
            createdAt: dt,
        })
        const doc = await findOne({
            getCollection: mockGetCollection,
            query: {
                createdAt: dt,
            },
        })
        assert(doc)
        assert(doc.name == 'vini')
    })

    it('should accept a string id', async () => {
        const id = generateNewId()
        const name = 'Joseph'
        const doc = { id, name }
        await insert(doc)
        const savedDoc = await findOne({
            query: {
                id
            },
            getCollection: mockGetCollection
        })
        assert(savedDoc)
        assert(savedDoc.id == id)
        assert(savedDoc.name == name)
    })
})