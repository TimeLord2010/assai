import { Collection } from 'mongodb'
import { renameToMongoId, stringsIntoId } from '../transformers/index.mjs'

/**
 * @template {import('../../types.js').MongoDocument} T
 * @param {object} params
 * @param {() => Promise<Collection<T>>} params.getCollection
 * @param {import('mongodb').Filter<T>} [params.query]
 */
export async function count({ getCollection, query }) {
    renameToMongoId(query)
    stringsIntoId(query)

    const col = await getCollection()
    const count = await col.countDocuments(query)
    return count
}