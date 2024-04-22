import { Collection } from 'mongodb'
import {
    idsIntoString,
    renameFindOptions,
    renameToDevId,
    renameToMongoId,
    stringsIntoId
} from '../transformers/index.mjs'

/**
 * @template {import('../../types.js').MongoDocument} T
 * @template {import('../../types.js').Projection<T>} K
 * @param {object} parameter
 * @param {() => Promise<Collection<T>>} parameter.getCollection
 * @param {import('mongodb').Filter<T>} parameter.query
 * @param {import('../../types.js').FindOptions<T, K>} [parameter.options]
 * @returns {Promise<T[]>}
 */
export async function find({ getCollection, query, options }) {
    renameToMongoId(query)
    renameFindOptions(options)

    stringsIntoId(query)

    const col = await getCollection()

    const docs = await col.find(query, options).toArray()
    const fixedDocs = docs.map((doc) => {
        idsIntoString(doc)
        const transformedDoc = renameToDevId(doc)
        return transformedDoc
    })
    return fixedDocs
}