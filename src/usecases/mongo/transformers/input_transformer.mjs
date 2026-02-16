import { renameToMongoId } from './id/rename_to_mongo_id.mjs'
import { stringsIntoId } from './object_id/strings_into_id.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} params
 * @param {import('../../../types.js').Optional<T, 'id'>} params.document
 * @param {import('../../../factories/create_mongo_collection.mjs').IcreateCollectionOptions<T>} [params.collectionOptions]
 */
export function inputTransformer({
    document, collectionOptions,
}) {
    document = renameToMongoId(document)
    stringsIntoId(document)

    const { timestamps } = collectionOptions ?? {}
    const { createdAt, updatedAt } = timestamps ?? {
        createdAt: 'generate',
        updatedAt: 'generate',
    }

    if (document.createdAt == null && createdAt === 'generate') {
        // @ts-ignore
        document.createdAt = new Date()
    }

    if (document.updatedAt == null && updatedAt === 'generate') {
        // @ts-ignore
        document.updatedAt = new Date()
    }

    return document
}