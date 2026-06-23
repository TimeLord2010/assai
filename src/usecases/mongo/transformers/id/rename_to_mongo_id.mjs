/**
 * ```
 * "id" -> "_id"
 * ```
 * Recursively renames all `id` keys to `_id` in objects and arrays.
 * Does not mutate the original input.
 * @param {*} obj
 */
export function renameToMongoId(obj) {
    if (obj == null) return obj
    if (typeof obj !== 'object') return obj
    if (obj instanceof Date) return obj

    if (Array.isArray(obj)) {
        let hasChanges = false
        const transformed = new Array(obj.length)
        for (let i = 0; i < obj.length; i++) {
            const item = obj[i]
            const transformedItem = renameToMongoId(item)
            transformed[i] = transformedItem
            if (transformedItem !== item) hasChanges = true
        }
        return hasChanges ? transformed : obj
    }

    let hasChanges = false
    /** @type {Record<string, any>} */
    const transformed = {}
    for (const [key, value] of Object.entries(obj)) {
        const newKey = key === 'id' ? '_id' : key
        const newValue = renameToMongoId(value)
        transformed[newKey] = newValue
        if (newKey !== key || newValue !== value) hasChanges = true
    }
    return hasChanges ? transformed : obj
}