import { renameToMongoId } from './index.mjs'

/**
 *
 * @param {import('../../../types.js').FindOptions<any ,any>} options
 */
export function renameFindOptions(options = {}) {
    renameToMongoId(options.projection)
    renameToMongoId(options.sort)
}