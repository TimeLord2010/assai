/**
 * ```
 * "_id" -> "id"
 * ```
 */
export function renameToDevId(obj) {
    if (!obj) return obj
    let { _id, ...rest } = obj
    if (!_id) return obj
    delete obj['_id']
    // if (_id instanceof ObjectId) {
    //     _id = _id.toHexString()
    // }
    obj.id = _id
    return obj
}