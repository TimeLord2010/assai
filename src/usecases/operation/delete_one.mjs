import { Collection } from 'mongodb'
import { renameToMongoId, stringsIntoId } from '../transformers/index.mjs'

/**
 * @template {import('../../types.js').MongoDocument} T
 * @param {object} parameter
 * @param {import('mongodb').Filter<T>} parameter.query
 * @param {() => Promise<Collection<T>>} parameter.getCollection
 * @returns {Promise<boolean>}
 */
export async function deleteOne({ query, getCollection }) {
    renameToMongoId(query)
    stringsIntoId(query)
    const col = await getCollection()
    const r = await col.deleteOne(query)
    return r.deletedCount > 0
}