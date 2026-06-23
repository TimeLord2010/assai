import { Collection, ObjectId } from 'mongodb'
import { inputTransformer } from '../transformers/input_transformer.mjs'
import { outputTransformer } from '../transformers/output_transformer.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} param
 * @param {import('../../../types.js').Optional<T, 'id'>[]} param.docs
 * @param {() => Promise<Collection<T>>} param.getCollection
 * @param {import('../../../factories/create_mongo_collection.mjs').IcreateCollectionOptions<T>} param.collectionOptions
 * @returns {Promise<T[]>}
 */
export async function insertMany({ docs, collectionOptions, getCollection }) {
    if (docs.length == 0) return []

    // We need to clone the array to prevent the function from changing the original input object.
    // This is necessary since we change the objects inside the array to rename the "id" to "_id".
    docs = [...docs]

    for (let i = 0; i < docs.length; i++) {
        docs[i] = inputTransformer({
            document: docs[i],
            collectionOptions: collectionOptions
        })
    }
    const col = await getCollection()
    const result = await col.insertMany(
        // @ts-ignore
        docs
    )
    let { insertedIds } = result
    const indexes = Object.keys(insertedIds)
    for (const index of indexes) {
        // @ts-ignore
        const id = insertedIds[index]
        if (id instanceof ObjectId) {
            // @ts-ignore
            docs[index].id = id.toHexString()
        }
    }
    return docs.map(doc => outputTransformer({
        // @ts-ignore
        document: doc,
        collectionOptions
    }))
}