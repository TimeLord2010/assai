import { MongoClient } from 'mongodb'
import { OperationFail } from './data/errors/operation_fail.mjs'

/** @type {MongoClient | null} */
let client = null

export async function getMongoClient() {
    if (!client) {
        const DATABASE_URL = process.env.DATABASE_URL
        if (DATABASE_URL == null) {
            throw new OperationFail('DATABASE_URL not configured')
        }
        client = await MongoClient.connect(DATABASE_URL)
    }
    return client
}

export async function closeMongoClient() {
    await client?.close()
    client = null
}