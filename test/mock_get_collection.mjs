import { Collection } from 'mongodb'
import { getMongoClient } from '../src/mongo_client.mjs'

export async function mockGetCollection(collectionName = 'test') {
    const client = await getMongoClient()
    const db = client.db()
    /** @type {Collection<any>} */
    const collection = db.collection(collectionName)
    return collection
}