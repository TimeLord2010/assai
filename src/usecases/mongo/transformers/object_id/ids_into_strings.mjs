import { ObjectId } from 'mongodb'

/**
 * Convert the parameter from `ObjectId` into string whenever possible.
 *
 * If an object or array is given, this function will be applied recursively.
 * @param {*} obj
 */
export function idsIntoString(obj) {
    if (obj == null) return obj
    if (typeof obj != 'object') return obj
    if (obj instanceof ObjectId) return obj.toHexString()
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            const item = obj[i]
            obj[i] = idsIntoString(item)
        }
        return obj
    }
    for (const [key, value] of Object.entries(obj)) {
        if (value instanceof ObjectId) {
            obj[key] = value.toHexString()
            continue
        }
        if (value != null && typeof value == 'object') {
            obj[key] = idsIntoString(value)
        }
    }
    return obj
}