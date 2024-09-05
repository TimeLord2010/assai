import { MongoMemoryServer } from 'mongodb-memory-server'
import { after, before } from 'node:test'
import { closeClient } from '../usecases/mongo/mongo_client.mjs'

/**
 * Starts a memory version of the mongodb server on a random free port.
 *
 * This method will also automatically close the connection with the database.
 */
export function manageMockDatabase() {
    /** @type {null | MongoMemoryServer} */
    let server = null

    before(async () => {
        server = await MongoMemoryServer.create()
        const uri = server.getUri('test')
        process.env.DATABASE_URL = uri
    })

    after(async () => {
        await closeClient()
        await server?.stop()
        process.exit()
    })
}