import { ObjectId } from 'mongodb'

/**
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