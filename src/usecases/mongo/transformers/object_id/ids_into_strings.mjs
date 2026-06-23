/**
 * Convert the parameter from `ObjectId` into string whenever possible.
 *
 * If an object or array is given, this function will be applied recursively.
 *
 * Uses duck-typing (`_bsontype === 'ObjectId'`) instead of `instanceof` to
 * safely identify ObjectId values across different instances of the `mongodb`
 * / `bson` package (e.g. when the host project and this library resolve to
 * separate copies of the package).
 * @param {*} obj
 */
export function idsIntoString(obj) {
    if (obj == null) return obj
    if (typeof obj != 'object') return obj
    if (isObjectId(obj)) return obj.toHexString()
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            const item = obj[i]
            obj[i] = idsIntoString(item)
        }
        return obj
    }
    for (const [key, value] of Object.entries(obj)) {
        if (isObjectId(value)) {
            obj[key] = value.toHexString()
            continue
        }
        if (value != null && typeof value == 'object') {
            obj[key] = idsIntoString(value)
        }
    }
    return obj
}

/**
 * Duck-type check for BSON ObjectId values.
 *
 * Using `_bsontype` instead of `instanceof ObjectId` avoids false negatives
 * that occur when the host project and this package resolve to different copies
 * of the `mongodb` / `bson` module, which makes `instanceof` return `false`
 * even for legitimate ObjectId instances.
 * @param {*} value
 * @returns {boolean}
 */
function isObjectId(value) {
    return value != null && typeof value == 'object' && value._bsontype === 'ObjectId'
}
