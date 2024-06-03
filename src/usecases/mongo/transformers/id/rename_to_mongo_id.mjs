/**
 * ```
 * "id" -> "_id"
 * ```
 */
export function renameToMongoId(obj) {
    if (!obj) return obj
    let { id, ...rest } = obj
    if (!id) return obj
    return {
        _id: id,
        ...rest
    }
}