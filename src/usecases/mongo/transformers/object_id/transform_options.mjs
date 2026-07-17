import { stringsIntoId } from './strings_into_id.mjs'

/**
 * Option fields that carry actual data values (documents/queries that may
 * contain ObjectId hex-strings), as opposed to metadata like sort directions,
 * index names or write concerns. These are the only fields that need the same
 * hex-string → `ObjectId` conversion applied to `query` and `update`.
 *
 * - `arrayFilters`: filters referencing filtered positional operators.
 * - `let`: variables accessible via `$$var` in `$expr`/pipeline updates.
 * - `min`/`max`: inclusive/exclusive index bounds (find only).
 * - `projection`: normally inclusion/exclusion flags, but may embed a query
 *   through operators like `$elemMatch`.
 *
 * Fields such as `session` (`ClientSession`), `signal` (`AbortSignal`),
 * `readPreference` and `writeConcern` are deliberately left out: `stringsIntoId`
 * only preserves `Date`, so recursing into those class instances would deep-clone
 * them into plain objects and break them. Scoping to data-bearing keys keeps the
 * conversion safe.
 */
const DATA_BEARING_KEYS = ['arrayFilters', 'let', 'min', 'max', 'projection']

/**
 * Applies `stringsIntoId` to the data-bearing fields of an operation's
 * `options`, leaving metadata and special objects untouched.
 *
 * Does not mutate the caller's `options`: a shallow copy is created only when a
 * field actually changes, otherwise the original reference is returned.
 *
 * @template {Record<string, any> | undefined} T
 * @param {T} options
 * @returns {T}
 */
export function transformOptions(options) {
    if (options == null) return options

    let result = options
    for (const key of DATA_BEARING_KEYS) {
        const value = options[key]
        if (value == null) continue

        const transformed = stringsIntoId(value)
        if (transformed !== value) {
            if (result === options) {
                result = { ...options }
            }
            result[key] = transformed
        }
    }

    return result
}
