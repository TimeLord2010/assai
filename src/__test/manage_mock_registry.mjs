import { fakerPT_BR } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import { after, before } from 'node:test'
import { generateNewId } from '../usecases/mongo/generate_new_id.mjs'
import { closeClient } from '../usecases/mongo/mongo_client.mjs'
import { deleteOne } from '../usecases/mongo/operation/delete_one.mjs'
import { insertOne } from '../usecases/mongo/operation/insert_one.mjs'
import { mockGetCollection } from './mock_get_collection.mjs'

/**
 *
 * @param {import('./mock_get_collection.mjs').ItestCollection} param
 * @param {object} options
 * @param {boolean} [options.deleteAtEnd]
 */
export function manageMockRegistry({ tag, ...rest } = {}, {
    deleteAtEnd = true
} = {}) {

    const id = generateNewId()
    const name = rest.name ?? fakerPT_BR.person.fullName()

    before(async () => {
        /** @type {import('./mock_get_collection.mjs').ItestCollection} */
        const doc = {
            id,
            createdAt: new Date(),
            tag,
            name: name,
            ...rest,
        }
        await insertOne({
            // @ts-ignore
            getCollection: mockGetCollection,
            doc: doc,
        })
    })

    after(async () => {
        if (deleteAtEnd) {
            await deleteOne({
                query: {
                    _id: ObjectId.createFromHexString(id)
                },
                // @ts-ignore
                getCollection: mockGetCollection,
            })
        }
        await closeClient()
    })

    return {
        id, name
    }
}