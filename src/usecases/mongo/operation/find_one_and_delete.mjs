import { Collection } from 'mongodb'
import { renameToMongoId, stringsIntoId } from '../transformers/index.mjs'
import { outputTransformer } from '../transformers/output_transformer.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} param
 * @param {import('mongodb').Filter<T>} param.query
 * @param {import('mongodb').FindOneAndDeleteOptions} [param.options]
 * @param {() => Promise<Collection<T>>} param.getCollection
 * @param {import('../../../factories/create_mongo_collection.mjs').IcreateCollectionOptions<T>} [param.collectionOptions]
 * @returns {Promise<T | null>}
 */
export async function findOneAndDelete({ query, options, collectionOptions, getCollection }) {
    query = renameToMongoId(query)
    query = stringsIntoId(query)
    const col = await getCollection()

    const doc = await col.findOneAndDelete(query, options ?? {})
    if (doc == null) return null

    return outputTransformer({ document: doc, collectionOptions })
}
