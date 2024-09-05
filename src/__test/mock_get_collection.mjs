import { Collection, ObjectId } from 'mongodb'
import { getClient } from '../usecases/mongo/mongo_client.mjs'

export async function mockGetCollection(collectionName = 'test') {
    const client = await getClient()
    const db = client.db()
    /** @type {Collection<ItestCollection>} */
    const collection = db.collection(collectionName)
    return collection
}

/**
 * @typedef {object} ItestCollection
 * @property {ObjectId} [_id]
 * @property {string} [id]
 * @property {string} [name]
 * @property {string | ObjectId} [tag]
 * @property {Date} [createdAt]
 * @property {object[]} [posts]
 * @property {object} [address]
 */