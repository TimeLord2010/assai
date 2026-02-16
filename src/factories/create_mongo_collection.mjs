import { Collection } from 'mongodb'
import {
    count, deleteMany, deleteOne,
    deleteOneOrThrow,
    find, findOne,
    getClient,
    insertMany, insertOne, updateMany, updateOne
} from '../usecases/mongo/index.mjs'

/**
 * Generates a collection object that automatically manage ObjectId conversion to string.
 *
 * This method will read the string DATABASE_URL to create a connection. If you have it in another
 * location, you will need to pass it at `connectionString` property inside the options parameter.
 *
 * The connection is cached by default. Use `collectionGetter` and `cachedCollectionGetter` to
 * customize this behavior.
 * @template {import('../types.js').MongoDocument} T
 * @param {string} name
 * @param {IcreateCollectionOptions<T>} [options]
 */
export function createMongoCollection(name, options = {}) {

    /** @type {Collection<T> | null} */
    let _collection = null
    const collectionOptions = options

    async function getCollection() {
        const {
            connectionString, dbName, options: createOptions,
            cachableCollectionGetter, collectionGetter,
        } = options

        // Connection getter from options
        if (collectionGetter != null) return await collectionGetter()

        // Checking cache
        if (_collection) return _collection

        // Cache function from options
        if (cachableCollectionGetter != null) {
            _collection = await cachableCollectionGetter()
            return _collection
        }

        // Default connection getter
        const client = await getClient({ connectionString })
        let db = client.db(dbName, createOptions)
        /** @type {Collection<T>} */
        _collection = db.collection(name)
        return _collection
    }

    return {
        /**
         * Returns the native driver.
         */
        getCollection,
        /**
         * @param {import('mongodb').Filter<T>} query
         */
        count: async (query = {}) => await count({ query, getCollection }),
        /**
         * @template {import('../types.js').Projection<T>} K
         * @param {import('mongodb').Filter<T>} query
         * @param {import('../types.js').FindOptions<T, K>} options
         * @returns {Promise<T[]>}
         */
        find: async (query, options = {}) => {
            return await find({ query, options, getCollection, collectionOptions })
        },
        /**
         * @template {import('../types.js').Projection<T> | undefined} K
         * @param {import('mongodb').Filter<T>} query
         * @param {import('../types.js').FindOptions<T,K>} options
         * @returns {Promise<T | null>}
         */
        findOne: async (query, options = {}) => {
            return await findOne({ query, options, collectionOptions, getCollection })
        },
        /**
         * @param {import('../types.js').Optional<T, 'id'>} doc
         * @returns {Promise<T>}
         */
        insertOne: async (doc) => {
            return await insertOne({
                doc,
                getCollection,
            })
        },
        /**
         *
         * @param {import('../types.js').Optional<T, 'id'>[]} docs
         * @returns {Promise<T[]>}
         */
        insertMany: async (docs) => await insertMany({ docs, collectionOptions, getCollection }),
        /**
         * @param {import('mongodb').Filter<T>} query
         * @returns {Promise<boolean>}
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
         * @param {import('mongodb').UpdateOptions} [options]
         */
        updateOne: async (query, update, options) => await updateOne({
            query, update, options, collectionOptions, getCollection,
        }),
        /**
         * @param {import('mongodb').Filter<T>} query
         * @param {import('mongodb').UpdateFilter<T>} update
         * @param {import('mongodb').UpdateOptions} [options]
         */
        updateMany: async (query, update, options) => await updateMany({
            query, update, options, collectionOptions, getCollection,
        })
    }
}

/**
 * @template {import('../types.js').MongoDocument} T
 * @callback IcollectionGetter
 * @returns {Promise<Collection<T>>}
 */

/**
 * @template {import('../types.js').MongoDocument} T
 * @typedef {object} IcreateCollectionOptions
 * @property {IcollectionGetter<T>} [options.collectionGetter]
 * A custom function to get the collection object from mongodb driver.
 *
 * This will be not be cached and will be used on every operation such as insertOne or findOne.
 *
 * If you wish to cache the collection object, see `cachableCollectionGetter`.
 *
 * Example:
 * ```js
 * collectionGetter: async () => await getMyCollection()
 * ```
 *
 * @property {IcollectionGetter<T>} [options.cachableCollectionGetter]
 * Same as `collectionGetter`. But the object is cached.
 *
 * Example:
 * ```js
 * cachableCollectionGetter: async () => await getMyCollection()
 * ```
 *
 * @property {string} [options.connectionString]
 * A custom connection string. If none is given, `process.env.DATABASE_URL` will be used.
 *
 * @property {string} [dbName] The name of the database.
 *
 * @property {import('mongodb').DbOptions} [options] The options used when initializing the client.
 *
 * @property {ItimestampConfiguration} [timestamps]
 */

/**
 * @typedef {object} ItimestampConfiguration
 * @property {'fromId' | 'generate' | 'none'} createdAt
 * @property {'generate' | 'none'} updatedAt
 */

/**
 * @template {import('../types.js').MongoDocument} T
 * @typedef {Awaited<ReturnType<typeof createMongoCollection<T>>>} ICollection
 */