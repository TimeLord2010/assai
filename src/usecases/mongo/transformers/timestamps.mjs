import { ObjectId } from 'mongodb'

/**
 * Transforms a document by adding or updating timestamp fields (createdAt and updatedAt).
 * If createdAt is not set, it can be generated as a new Date or extracted from the document's ObjectId.
 * If updatedAt is not set, it is generated as a new Date.
 * The document is modified in place.
 *
 * @template {import('../../../types.js').MongoDocument} T
 * @param {import('mongodb').WithId<T> | import('../../../types.js').MongoDocument} doc
 * @param {import('../../../factories/create_mongo_collection.mjs').IcreateCollectionOptions<T>} options
 */
export function timestampTransformer(doc, options) {
    const { timestamps } = options
    const { createdAt, updatedAt } = timestamps ?? {
        createdAt: 'generate',
        updatedAt: 'generate',
    }

    if (doc.createdAt == null) {
        if (createdAt == 'fromId') {
            const _id = doc._id
            if (_id instanceof ObjectId) {
                doc.createdAt = _id.getTimestamp()
            }
        } else if (createdAt == 'generate') {
            doc.createdAt = new Date()
        }
    }
    if (doc.updatedAt == null && updatedAt == 'generate') {
        doc.updatedAt = new Date()
    }
}