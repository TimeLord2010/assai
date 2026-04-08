import { Collection } from 'mongodb'
import { renameToMongoId, stringsIntoId } from '../transformers/index.mjs'
import { inputTransformer } from '../transformers/input_transformer.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} parameter
 * @param {() => Promise<Collection<T>>} parameter.getCollection
 * @param {import('mongodb').AnyBulkWriteOperation<T>[]} parameter.operations
 * @param {import('mongodb').BulkWriteOptions} [parameter.options]
 * @param {import('../../../factories/create_mongo_collection.mjs').IcreateCollectionOptions<T>} [parameter.collectionOptions]
 */
export async function bulkWrite({ getCollection, operations, options, collectionOptions }) {
    for (const op of operations) {
        /** @type {any} */
        const o = op
        if (o.insertOne != null) {
            o.insertOne.document = inputTransformer({
                document: o.insertOne.document,
                collectionOptions,
            })
        } else if (o.updateOne != null) {
            o.updateOne.filter = renameToMongoId(o.updateOne.filter)
            stringsIntoId(o.updateOne.filter)
            stringsIntoId(o.updateOne.update)
        } else if (o.updateMany != null) {
            o.updateMany.filter = renameToMongoId(o.updateMany.filter)
            stringsIntoId(o.updateMany.filter)
            stringsIntoId(o.updateMany.update)
        } else if (o.deleteOne != null) {
            o.deleteOne.filter = renameToMongoId(o.deleteOne.filter)
            stringsIntoId(o.deleteOne.filter)
        } else if (o.deleteMany != null) {
            o.deleteMany.filter = renameToMongoId(o.deleteMany.filter)
            stringsIntoId(o.deleteMany.filter)
        } else if (o.replaceOne != null) {
            o.replaceOne.filter = renameToMongoId(o.replaceOne.filter)
            stringsIntoId(o.replaceOne.filter)
            stringsIntoId(o.replaceOne.replacement)
        }
    }

    const col = await getCollection()
    const result = await col.bulkWrite(operations, options)

    if (result.insertedIds) {
        for (const key of Object.keys(result.insertedIds)) {
            // @ts-ignore
            result.insertedIds[key] = result.insertedIds[key].toHexString()
        }
    }

    return result
}
