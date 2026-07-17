import { Collection } from 'mongodb'
import { renameToMongoId, stringsIntoId, transformOptions } from '../transformers/index.mjs'
import { outputTransformer } from '../transformers/output_transformer.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} param
 * @param {import('mongodb').Filter<T>} param.query
 * @param {import('mongodb').WithoutId<T>} param.replacement
 * @param {import('mongodb').FindOneAndReplaceOptions} [param.options]
 * @param {() => Promise<Collection<T>>} param.getCollection
 * @param {import('../../../factories/create_mongo_collection.mjs').IcreateCollectionOptions<T>} [param.collectionOptions]
 * @returns {Promise<T | null>}
 */
export async function findOneAndReplace({ query, replacement, options, collectionOptions, getCollection }) {
    query = renameToMongoId(query)
    query = stringsIntoId(query)
    const col = await getCollection()

    options = transformOptions(options)

    const doc = await col.findOneAndReplace(query, replacement, options ?? {})
    if (doc == null) return null

    return outputTransformer({ document: doc, collectionOptions })
}
