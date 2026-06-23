/**
 * ```
 * "_id" -> "id"
 * ```
 * Recursively renames all `_id` keys to `id` in objects and arrays.
 * Does not mutate the original input.
 * @param {*} obj
 */
export function renameToDevId(obj) {
    if (obj == null) return obj
    if (typeof obj !== 'object') return obj
    if (obj instanceof Date) return obj

    if (Array.isArray(obj)) {
        let hasChanges = false
        const transformed = new Array(obj.length)
        for (let i = 0; i < obj.length; i++) {
            const item = obj[i]
            const transformedItem = renameToDevId(item)
            transformed[i] = transformedItem
            if (transformedItem !== item) hasChanges = true
        }
        return hasChanges ? transformed : obj
    }

    let hasChanges = false
    /** @type {Record<string, any>} */
    const transformed = {}
    for (const [key, value] of Object.entries(obj)) {
        const newKey = key === '_id' ? 'id' : key
        const newValue = renameToDevId(value)
        transformed[newKey] = newValue
        if (newKey !== key || newValue !== value) hasChanges = true
    }
    return hasChanges ? transformed : obj
}