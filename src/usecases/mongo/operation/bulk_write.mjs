import { Collection } from 'mongodb'
import { renameToMongoId, stringsIntoId, transformOptions } from '../transformers/index.mjs'
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
            o.updateOne.filter = stringsIntoId(o.updateOne.filter)
            o.updateOne.update = stringsIntoId(o.updateOne.update)
            // `o.updateOne` is a bulk operation descriptor, not an `options` object,
            // but it carries `arrayFilters` at the same top level that transformOptions
            // looks for. `filter`/`update`/`upsert` aren't data-bearing keys, so they
            // are left untouched — this reuses the same conversion without duplicating it.
            o.updateOne = transformOptions(o.updateOne)
        } else if (o.updateMany != null) {
            o.updateMany.filter = renameToMongoId(o.updateMany.filter)
            o.updateMany.filter = stringsIntoId(o.updateMany.filter)
            o.updateMany.update = stringsIntoId(o.updateMany.update)
            // See the note above: same reuse of transformOptions on the operation descriptor.
            o.updateMany = transformOptions(o.updateMany)
        } else if (o.deleteOne != null) {
            o.deleteOne.filter = renameToMongoId(o.deleteOne.filter)
            o.deleteOne.filter = stringsIntoId(o.deleteOne.filter)
        } else if (o.deleteMany != null) {
            o.deleteMany.filter = renameToMongoId(o.deleteMany.filter)
            o.deleteMany.filter = stringsIntoId(o.deleteMany.filter)
        } else if (o.replaceOne != null) {
            o.replaceOne.filter = renameToMongoId(o.replaceOne.filter)
            o.replaceOne.filter = stringsIntoId(o.replaceOne.filter)
            o.replaceOne.replacement = stringsIntoId(o.replaceOne.replacement)
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
