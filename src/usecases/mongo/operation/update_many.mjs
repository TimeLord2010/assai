import { Collection } from 'mongodb'
import { renameToMongoId, stringsIntoId } from '../transformers/index.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} param
 * @param {import('mongodb').Filter<T>} param.query
 * @param {import('mongodb').UpdateFilter<T>} param.update
 * @param {import('mongodb').UpdateOptions} [param.options]
 * @param {() => Promise<Collection<T>>} param.getCollection
 * @param {import('../../../factories/create_mongo_collection.mjs').IcreateCollectionOptions<T>} [param.collectionOptions]
 */
export async function updateMany({ query, update, options, collectionOptions, getCollection }) {
    query = renameToMongoId(query)
    stringsIntoId(query)
    stringsIntoId(update)

    const { timestamps } = collectionOptions ?? {}
    const { updatedAt } = timestamps ?? {
        updatedAt: 'generate'
    }

    const { $set } = update
    const hasUpdatedAt = $set != null && $set.updatedAt != null
    if (!hasUpdatedAt && updatedAt === 'generate') {
        if ($set != null) {
            // @ts-ignore
            $set.updatedAt = new Date()
        } else {
            // @ts-ignore
            update.$set = {
                updatedAt: new Date()
            }
        }
    }

    const col = await getCollection()
    const r = await col.updateMany(query, update, options)
    return r
}