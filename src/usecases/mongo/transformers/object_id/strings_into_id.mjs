import { ObjectId } from 'mongodb'

/**
 * Converts the input value into an `ObjectId`, doing a recursive internal search if possible.
 *
 * This function will do a recursive operation if the parameter is any of the following:
 * - An object;
 * - An array;
 *
 * If the parameter is a string, then it is converted to `ObjectId` if possible.
 *
 * This function does not mutate the original input. It preserves reference equality for
 * objects and special types (like Date) that don't need transformation.
 * @param {*} obj
 */
export function stringsIntoId(obj) {
    if (obj == null) return obj
    if (isObjectIdString(obj)) return new ObjectId(obj)
    if (typeof obj != 'object') return obj

    // Check if this object/array needs any transformation
    const transformed = _transformRecursive(obj)
    return transformed
}

/**
 * Recursively transforms ObjectId hex strings to ObjectId instances.
 * Returns the original reference if no changes are needed, or a new object if changes are made.
 * @param {*} obj
 * @returns {*}
 */
function _transformRecursive(obj) {
    if (obj == null || typeof obj != 'object') return obj

    // Don't clone or transform special objects like Date
    if (obj instanceof Date) return obj

    if (Array.isArray(obj)) {
        let hasChanges = false
        const transformed = new Array(obj.length)

        for (let i = 0; i < obj.length; i++) {
            const item = obj[i]
            if (isObjectIdString(item)) {
                transformed[i] = new ObjectId(item)
                hasChanges = true
            } else if (item != null && typeof item == 'object') {
                const transformedItem = _transformRecursive(item)
                transformed[i] = transformedItem
                if (transformedItem !== item) {
                    hasChanges = true
                }
            } else {
                transformed[i] = item
            }
        }

        return hasChanges ? transformed : obj
    }

    // Handle plain objects
    let hasChanges = false
    /** @type {Record<string, any>} */
    const transformed = {}

    for (const [key, value] of Object.entries(obj)) {
        if (isObjectIdString(value)) {
            transformed[key] = ObjectId.createFromHexString(value)
            hasChanges = true
        } else if (value != null && typeof value == 'object') {
            const transformedValue = _transformRecursive(value)
            transformed[key] = transformedValue
            if (transformedValue !== value) {
                hasChanges = true
            }
        } else {
            transformed[key] = value
        }
    }

    return hasChanges ? transformed : obj
}

/**
 *
 * @param {*} value
 * @returns {value is string}
 */
function isObjectIdString(value) {
    return typeof value == 'string' && ObjectId.isValid(value)
}