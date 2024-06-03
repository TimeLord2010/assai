/**
 * ```
 * "_id" -> "id"
 * ```
 */
export function renameToDevId(obj) {
    if (!obj) return obj
    let { _id, ...rest } = obj
    if (!_id) return obj
    return {
        id: _id,
        ...rest
    }
}