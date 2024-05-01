import { Collection, ObjectId } from 'mongodb'
import { renameToMongoId, stringsIntoId } from '../transformers/index.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} param
 * @param {import('../../../types.js').Optional<T, 'id'>} param.doc
 * @param {() => Promise<Collection<T>>} param.getCollection
 * @returns {Promise<T>}
 */
export async function insertOne({ doc, getCollection }) {
    renameToMongoId(doc)
    stringsIntoId(doc)
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