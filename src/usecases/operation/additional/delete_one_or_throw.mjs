import { Collection } from 'mongodb'
import { OperationFail } from '../../../data/errors/operation_fail.mjs'
import { deleteOne } from '../delete_one.mjs'

/**
 * @template {import('../../../types.js').MongoDocument} T
 * @param {object} param
 * @param {import('mongodb').Filter<T>} param.query
 * @param {() => Promise<Collection<T>>} param.getCollection
 */
export async function deleteOneOrThrow({
    query, getCollection,
}) {
    const deleted = await deleteOne({ query, getCollection })
    if (!deleted) {
        throw new OperationFail('Delete one did not delete any documents')
    }
}