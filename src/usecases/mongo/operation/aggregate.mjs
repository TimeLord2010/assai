import { Collection } from 'mongodb'
import { renameToMongoId, stringsIntoId, transformOptions } from '../transformers/index.mjs'
import { outputTransformer } from '../transformers/output_transformer.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} parameter
 * @param {() => Promise<Collection<T>>} parameter.getCollection
 * @param {import('mongodb').Document[]} parameter.pipeline
 * @param {import('mongodb').AggregateOptions} [parameter.options]
 * @param {import('../../../factories/create_mongo_collection.mjs').IcreateCollectionOptions<T>} [parameter.collectionOptions]
 * @returns {Promise<T[]>}
 */
export async function aggregate({ getCollection, pipeline, options, collectionOptions }) {
    const finalPipeline = stringsIntoId(renameToMongoId(pipeline))

    const col = await getCollection()
    options = transformOptions(options)
    const docs = await col.aggregate(finalPipeline, options).toArray()
    // @ts-ignore
    return docs.map((doc) => outputTransformer({ document: doc, collectionOptions }))
}
