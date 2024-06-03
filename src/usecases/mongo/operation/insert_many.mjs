import { Collection, ObjectId } from 'mongodb'
import { renameToMongoId, stringsIntoId } from '../transformers/index.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} param
 * @param {import('../../../types.js').Optional<T, 'id'>[]} param.docs
 * @param {() => Promise<Collection<T>>} param.getCollection
 * @returns {Promise<T[]>}
 */
export async function insertMany({ docs, getCollection }) {
    if (docs.length == 0) return []

    // We need to clone the array to prevent the function from changing the original input object.
    // This is necessary since we change the objects inside the array to rename the "id" to "_id".
    docs = [...docs]

    for (let i = 0; i < docs.length; i++) {
        docs[i] = renameToMongoId(docs[i])
        stringsIntoId(docs[i])
    }
    const col = await getCollection()
    const result = await col.insertMany(
        // @ts-ignore
        docs
    )
    let { insertedIds } = result
    const indexes = Object.keys(insertedIds)
    for (const index of indexes) {
        const id = insertedIds[index]
        if (id instanceof ObjectId) {
            docs[index].id = id.toHexString()
        }
    }
    // @ts-ignore
    return docs
}