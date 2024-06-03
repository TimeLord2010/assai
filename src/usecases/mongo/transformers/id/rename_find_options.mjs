import { renameToMongoId } from './index.mjs'

/**
 *
 * @param {import('../../../../types.js').FindOptions<any ,any>} options
 */
export function renameFindOptions(options = {}) {
    return {
        projection: renameToMongoId(options.projection),
        sort: renameToMongoId(options.sort)
    }
}