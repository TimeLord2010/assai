import { Collection, Db, ObjectId } from 'mongodb'
import { OperationFail } from './data/errors/operation_fail.mjs'
import { getMongoClient } from './mongo_client.mjs'
import {
    idsIntoString, renameToDevId, renameToMongoId, stringsIntoId
} from './usecases/transformers/index.mjs'

/**
 * @template {import('./types.js').MongoDocument} T
 * @param {string} name
 * @param {Db} [db]
 */
export async function getCollection(name, db) {
    if (!db) {
        const client = await getMongoClient()
        db = client.db()
    }
    /** @type {Collection<T>} */
    // @ts-ignore
    const col = db.collection(name)

    /**
     * @template {import('./types.js').Projection<T>} K
     * @param {import('mongodb').Filter<T>} query
     * @param {import('./types.js').FindOptions<T, K>} options
     * @returns {Promise<T[]>}
     */
    async function find(query, options = {}) {
        renameToMongoId(query)
        renameFindOptions(options)

        stringsIntoId(query)

        const docs = await col.find(query, options).toArray()
        const fixedDocs = docs.map((doc) => {
            idsIntoString(doc)
            const transformedDoc = renameToDevId(doc)
            return transformedDoc
        })
        return fixedDocs
    }

    /**
     *
     * @param {import('mongodb').Filter<T>} query
     */
    const deleteOne = async (query) => {
        renameToMongoId(query)
        stringsIntoId(query)
        const r = await col.deleteOne(query)
        return r.deletedCount > 0
    }

    return {
        /**
         *
         * @param {import('mongodb').Filter<T>} query
         */
        count: async (query = {}) => {
            renameToMongoId(query)
            stringsIntoId(query)
            const count = await col.countDocuments(query)
            return count
        },
        find: find,
        /**
         * @template {import('./types.js').Projection<T> | undefined} K
         * @param {import('mongodb').Filter<T>} query
         * @param {import('./types.js').FindOptions<T,K>} options
         */
        findOne: async (query, options = {}) => {
            const docs = await find(query, {
                limit: 1,
                ...options,
            })
            const doc = docs[0]
            if (doc == null) {
                return null
            }
            return doc
        },
        /**
         *
         * @param {import('./types.js').Optional<T, 'id'>} doc
         * @returns {Promise<T>}
         */
        insertOne: async (doc) => {
            createIdIfNecessary(doc)
            stringsIntoId(doc)
            // @ts-ignore
            const result = await col.insertOne(doc)
            let id = result.insertedId
            if (id instanceof ObjectId) {
                // @ts-ignore
                id = id.toHexString()
            }
            // @ts-ignore
            return {
                id,
                ...doc,
            }
        },
        deleteOne: deleteOne,
        /**
         * Deleted the first document to match the query.
         * This method will throw an error if no documents were deleted.
         * @param {import('mongodb').Filter<T>} query
         * @throw {@link OperationFail} If not document was deleted
         */
        requireDeleteOne: async (query) => {
            const deleted = await deleteOne(query)
            if (!deleted) {
                throw new OperationFail('Delete one did not delete any documents')
            }
        },
        /**
         *
         * @param {import('mongodb').Filter<T>} query
         * @param {import('mongodb').UpdateFilter<T>} update
         */
        updateOne: async (query, update) => {
            renameToMongoId(query)
            stringsIntoId(query)
            stringsIntoId(update)
            const r = await col.updateOne(query, update)
            return r.matchedCount > 0
        },
    }
}

/**
 *
 * @param {import('./types.js').FindOptions<any ,any>} options
 */
function renameFindOptions(options = {}) {
    renameToMongoId(options.projection)
    renameToMongoId(options.sort)
}

function createIdIfNecessary(obj) {
    const id = obj._id
    if (id) {
        if (id instanceof ObjectId) {
            obj._id = id.toHexString()
        }
    } else {
        obj._id = new ObjectId().toHexString()
    }
    return obj
}

/**
 * @template {import('./types.js').MongoDocument} T
 * @typedef {Awaited<ReturnType<typeof getCollection<T>>>} ICollection
 */