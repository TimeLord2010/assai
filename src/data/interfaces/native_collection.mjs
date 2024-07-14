/**
 * @template {import('mongodb').Document} T
 * @typedef {object} InativeCollection
 * @property {InativeInsertOne<T>} insertOne
 * @property {InativeDeleteOne<T>} deleteOne
 * @property {InativeUpdateOne<T>} updateOne
 */

/**
 * @template {import('mongodb').Document} T
 * @callback InativeInsertOne
 * @param {import('../../types.js').Optional<T, '_id'>} data
 * @returns {Promise<any>}
 */

/**
 * @template {import('mongodb').Document} T
 * @callback InativeDeleteOne
 * @param {import('mongodb').Filter<T>} filter
 * @returns {Promise<any>}
 */

/**
 * @template {import('mongodb').Document} T
 * @callback InativeUpdateOne
 * @param {import('mongodb').Filter<T>} filter
 * @param {import('mongodb').UpdateFilter<T>} update
 */