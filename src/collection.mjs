import { Collection } from 'mongodb'
import { getMongoClient } from './mongo_client.mjs'
import { deleteOneOrThrow } from './usecases/operation/additional/index.mjs'
import {
    count, deleteMany, deleteOne, find, findOne, insertOne, updateMany, updateOne,
} from './usecases/operation/index.mjs'

/**
 * @template {import('./types.js').MongoDocument} T
 * @param {string} name
 * @param {object} [options]
 * @param {IcollectionGetter<T>} [options.collectionGetter]
 * @param {IcollectionGetter<T>} [options.cachedCollectionGetter]
 * @param {string} [options.connectionString]
 */
export async function getCollection(name, options = {}) {

    /** @type {Collection<T> | null} */
    let _collection = null

    async function getCollection() {
        const { connectionString, cachedCollectionGetter, collectionGetter } = options

        // Connection getter from options
        if (collectionGetter != null) return await collectionGetter()

        // Checking cache
        if (_collection) return _collection

        // Cache function from options
        if (cachedCollectionGetter != null) {
            _collection = await cachedCollectionGetter()
            return _collection
        }

        // Default connection getter
        const client = await getMongoClient({ connectionString })
        let db = client.db()
        /** @type {Collection<T>} */
        _collection = db.collection(name)
        return _collection
    }

    return {
        /**
         * @param {import('mongodb').Filter<T>} query
         */
        count: async (query = {}) => await count({ query, getCollection }),
        /**
         * @template {import('./types.js').Projection<T>} K
         * @param {import('mongodb').Filter<T>} query
         * @param {import('./types.js').FindOptions<T, K>} options
         */
        find: async (query, options = {}) => await find({ query, options, getCollection }),
        /**
         * @template {import('./types.js').Projection<T> | undefined} K
         * @param {import('mongodb').Filter<T>} query
         * @param {import('./types.js').FindOptions<T,K>} options
         */
        findOne: async (query, options = {}) => {
            return await findOne({ query, options, getCollection })
        },
        /**
         * @param {import('./types.js').Optional<T, 'id'>} doc
         */
        insertOne: async (doc) => await insertOne({ doc, getCollection }),
        /**
         * @param {import('mongodb').Filter<T>} query
         */
        deleteOne: async (query) => await deleteOne({ query, getCollection }),
        /**
         * Deletes the first document to match the query.
         * This method will throw an error if no documents were deleted.
         * @param {import('mongodb').Filter<T>} query
         * @throw {@link OperationFail} If not document was deleted
         */
        deleteOneOrThrow: async query => await deleteOneOrThrow({ query, getCollection }),
        /**
         *
         * @param {import('mongodb').Filter<T>} query
         */
        deleteMany: async (query) => await deleteMany({ query, getCollection }),
        /**
         * @param {import('mongodb').Filter<T>} query
         * @param {import('mongodb').UpdateFilter<T>} update
         */
        updateOne: async (query, update) => await updateOne({ query, update, getCollection }),
        /**
         * @param {import('mongodb').Filter<T>} query
         * @param {import('mongodb').UpdateFilter<T>} update
         */
        updateMany: async (query, update) => await updateMany({ query, update, getCollection })
    }
}

/**
 * @template {import('./types.js').MongoDocument} T
 * @callback IcollectionGetter
 * @returns {Promise<Collection<T>>}
 */

/**
 * @template {import('./types.js').MongoDocument} T
 * @typedef {Awaited<ReturnType<typeof getCollection<T>>>} ICollection
 */