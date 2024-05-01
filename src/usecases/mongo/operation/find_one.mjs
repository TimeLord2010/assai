import { Collection } from 'mongodb'
import { find } from './find.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @template {import('../../../types.js').Projection<T> | undefined} K
 * @param {object} param
 * @param {import('mongodb').Filter<T>} param.query
 * @param {import('../../../types.js').FindOptions<T, K>} [param.options]
 * @param {() => Promise<Collection<T>>} param.getCollection
 */
export async function findOne({ query, options, getCollection }) {
    const docs = await find({
        query,
        options: {
            limit: 1,
            ...options,
        },
        getCollection,
    })
    const doc = docs[0]
    if (doc == null) {
        return null
    }
    return doc
}