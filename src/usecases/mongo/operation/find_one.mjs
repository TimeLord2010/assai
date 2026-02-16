import { Collection } from 'mongodb'
import { outputTransformer } from '../transformers/output_transformer.mjs'
import { find } from './find.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @template {import('../../../types.js').Projection<T> | undefined} K
 * @param {object} param
 * @param {import('mongodb').Filter<T>} param.query
 * @param {import('../../../types.js').FindOptions<T, K>} [param.options]
 * @param {() => Promise<Collection<T>>} param.getCollection
 * @param {import('../../../factories/create_mongo_collection.mjs').IcreateCollectionOptions<T>} param.collectionOptions
 * @returns {Promise<T | null>}
 */
export async function findOne({ query, options, collectionOptions, getCollection }) {
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

    return outputTransformer({
        document: doc,
        collectionOptions,
    })
}