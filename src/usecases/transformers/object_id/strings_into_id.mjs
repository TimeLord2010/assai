import { ObjectId } from 'mongodb'

/**
 * Converts the input value into an `ObjectId`, doing a recursive internal search if possible.
 *
 * This function will do a recursive operation if the parameter is any of the following:
 * - An object;
 * - An array;
 *
 * If the parameter is a string, then it is converted to `ObjectId` if possible.
 * @param {*} obj
 */
export function stringsIntoId(obj) {
    if (obj == null) return obj
    if (isObjectIdString(obj)) return new ObjectId(obj)
    if (typeof obj != 'object') return obj
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            const item = obj[i]
            obj[i] = stringsIntoId(item)
        }
        return obj
    }
    for (const [key, value] of Object.entries(obj)) {
        if (isObjectIdString(value)) {
            obj[key] = ObjectId.createFromHexString(value)
        }
        if (value != null && typeof value == 'object') {
            obj[key] = stringsIntoId(value)
        }
    }
    return obj
}

/**
 *
 * @param {*} value
 * @returns {value is string}
 */
function isObjectIdString(value) {
    return typeof value == 'string' && ObjectId.isValid(value)
}