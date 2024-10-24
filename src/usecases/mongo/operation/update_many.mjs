import { Collection } from 'mongodb'
import { renameToMongoId, stringsIntoId } from '../transformers/index.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} param
 * @param {import('mongodb').Filter<T>} param.query
 * @param {import('mongodb').UpdateFilter<T>} param.update
 * @param {import('mongodb').UpdateOptions} [param.options]
 * @param {() => Promise<Collection<T>>} param.getCollection
 */
export async function updateMany({ query, update, options, getCollection }) {
    query = renameToMongoId(query)
    stringsIntoId(query)
    stringsIntoId(update)
    const col = await getCollection()
    const r = await col.updateMany(query, update, options)
    return r
}