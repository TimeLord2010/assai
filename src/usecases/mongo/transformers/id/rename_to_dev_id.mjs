/**
 * ```
 * "_id" -> "id"
 * ```
 */
export function renameToDevId(obj) {
    if (!obj) return obj
    let { _id, ...rest } = obj
    if (_id === undefined) return obj
    if (_id === null) return rest
    return {
        id: _id,
        ...rest
    }
}