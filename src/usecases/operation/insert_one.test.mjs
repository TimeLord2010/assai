import { ObjectId } from 'mongodb'
import assert from 'node:assert'
import { after, before, describe, it } from 'node:test'
import { mockGetCollection } from '../../../test/mock_get_collection.mjs'
import { closeMongoClient } from '../../mongo_client.mjs'
import { generateNewId } from '../generate_new_id.mjs'
import { insertOne } from './insert_one.mjs'

describe('insertOne', () => {

    before(async () => {
        // Opening the connection a head of time.
        await mockGetCollection()
    })

    after(() => {
        closeMongoClient()
    })

    async function insert(doc) {
        await insertOne({
            doc,
            // @ts-ignore
            getCollection: mockGetCollection,
        })
    }

    it('should accept a string ids', async () => {
        const id = generateNewId()
        const userId = generateNewId()
        const postId = generateNewId()
        const addressId = generateNewId()
        const name = 'Joseph'
        const doc = {
            id,
            name,
            userId,
            posts: [{ postId }],
            address: { addressId },
        }
        await insert(doc)
        const col = await mockGetCollection()
        const savedDoc = await col.findOne({ _id: new ObjectId(id) })
        assert(savedDoc)

        // Checking if normal properties are correctly set
        assert(savedDoc.name == name)

        // Checking _id is indeed an ObjectId instance
        const _id = savedDoc._id
        assert(_id instanceof ObjectId)
        assert(_id.toHexString() == id)

        // Checking if ids inside arrays are correctly mapped
        const savedPostId = savedDoc.posts?.[0].postId
        assert(savedPostId instanceof ObjectId)
        assert(savedPostId.toHexString() == postId)

        // Checking if ids inside objects are correctly mapped
        const savedAddressId = savedDoc.address.addressId
        assert(savedAddressId instanceof ObjectId)
        assert(savedAddressId.toHexString() == addressId)
    })

    it('should accept ObjectId as usual', async () => {
        const id = new ObjectId()
        const name = 'Jotoro'
        const doc = { id, name }
        await insert(doc)

        const col = await mockGetCollection()
        const savedDoc = await col.findOne({ _id: id })
        assert(savedDoc)

        assert(savedDoc.name == name)

        const _id = savedDoc._id
        assert(_id instanceof ObjectId)
        assert(_id.toHexString() == id.toHexString())
    })
})