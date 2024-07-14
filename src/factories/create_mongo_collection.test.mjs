import { describe } from 'node:test'
import { createMongoCollection } from './create_mongo_collection.mjs'
import { createMockCollection } from './create_mock_collection.mjs'

describe('validation', () => {

    const collection = createMongoCollection('user', {
        cachableCollectionGetter: async () => createMockCollection()
    })
})