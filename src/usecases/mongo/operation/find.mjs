import { Collection } from 'mongodb'
import {
    renameFindOptions,
    renameToMongoId,
    stringsIntoId
} from '../transformers/index.mjs'
import { outputTransformer } from '../transformers/output_transformer.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @template {import('../../../types.js').Projection<T>} K
 * @param {object} parameter
 * @param {() => Promise<Collection<T>>} parameter.getCollection
 * @param {import('mongodb').Filter<T>} parameter.query
 * @param {import('../../../types.js').FindOptions<T, K>} [parameter.options]
 * @param {import('../../../factories/create_mongo_collection.mjs').IcreateCollectionOptions<T>} [parameter.collectionOptions]
 * @returns {Promise<T[]>}
 */
export async function find({ getCollection, query, options, collectionOptions }) {
    query = renameToMongoId(query)
    options = renameFindOptions(options)

    query = stringsIntoId(query)

    const col = await getCollection()

    const docs = await col.find(query, options).toArray()
    const fixedDocs = docs.map((doc) => {
        return outputTransformer({
            document: doc,
            collectionOptions,
        })
    })
    return fixedDocs
}