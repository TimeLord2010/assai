import { Collection } from 'mongodb'
import { renameToMongoId, stringsIntoId } from '../transformers/index.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} parameter
 * @param {import('mongodb').Filter<T>} parameter.query
 * @param {() => Promise<Collection<T>>} parameter.getCollection
 */
export async function deleteMany({ query, getCollection }) {
    renameToMongoId(query)
    stringsIntoId(query)
    const col = await getCollection()
    const r = await col.deleteMany(query)
    return r.deletedCount
}