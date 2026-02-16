import { Collection, ObjectId } from 'mongodb'
import { inputTransformer } from '../transformers/input_transformer.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} param
 * @param {import('../../../types.js').Optional<T, 'id'>} param.doc
 * @param {() => Promise<Collection<T>>} param.getCollection
 * @param {import('../../../factories/create_mongo_collection.mjs').IcreateCollectionOptions<T>} [param.collectionOptions]
 * @returns {Promise<T>}
 */
export async function insertOne({ doc, collectionOptions, getCollection }) {
    doc = inputTransformer({
        document: doc,
        collectionOptions
    })

    const col = await getCollection()
    const result = await col.insertOne(
        // @ts-ignore
        doc
    )
    let id = result.insertedId
    if (id instanceof ObjectId) {
        // @ts-ignore
        id = id.toHexString()
    }

    // @ts-ignore
    return { id, ...doc }
}