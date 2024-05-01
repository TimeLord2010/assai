/**
 * ```
 * "id" -> "_id"
 * ```
 */
export function renameToMongoId(obj) {
    if (!obj) return obj
    let { id, ...rest } = obj
    if (!id) return obj
    delete obj['id']
    // if (_id instanceof ObjectId) {
    //     _id = _id.toHexString()
    // }
    obj._id = id
    return obj
}