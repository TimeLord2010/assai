import { MongoClient } from 'mongodb'
import { OperationFail } from '../../data/errors/operation_fail.mjs'

/** @type {MongoClient | null} */
let client = null

/**
 *
 * @param {object} params
 * @param {string} [params.connectionString]
 */
export async function getClient({
    connectionString,
} = {}) {
    if (!client) {
        function getCS() {
            if (typeof connectionString == 'string') return connectionString
            const DATABASE_URL = process.env.DATABASE_URL
            if (DATABASE_URL == null) {
                throw new OperationFail('DATABASE_URL not configured')
            }
            return DATABASE_URL
        }
        const cs = getCS()
        client = await MongoClient.connect(cs)
    }
    return client
}

export async function closeClient() {
    if (client == null) {
        return false
    }
    await client?.close()
    client = null
    return true
}