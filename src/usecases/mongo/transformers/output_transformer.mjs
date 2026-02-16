import { renameToDevId } from './id/rename_to_dev_id.mjs'
import { idsIntoString } from './object_id/ids_into_strings.mjs'
import { timestampTransformer } from './timestamps.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} p
 * @param {import('mongodb').WithId<T> | T} p.document
 * @param {import('../../../factories/create_mongo_collection.mjs').IcreateCollectionOptions<T>} [p.collectionOptions]
 */
export function outputTransformer({
    document, collectionOptions,
}) {
    if (collectionOptions) timestampTransformer(document, collectionOptions)
    idsIntoString(document)
    const transformedDoc = renameToDevId(document)
    return transformedDoc
}