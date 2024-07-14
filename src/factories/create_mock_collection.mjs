import { ObjectId } from 'mongodb'
import { NotImplemented } from '../data/errors/unsupported_error.mjs'

/** @type {Record<string, any[]>} */
const memory = {}

/**
 * @template {import('mongodb').Document} T
 * @param {string} [name]
 * @returns {import('../data/interfaces/native_collection.mjs').InativeCollection<T>}
 */
export function createMockCollection(name = 'mock') {

    function getItems() {
        let items = memory[name]
        if (items == null) {
            items = []
            memory[name] = items
        }
        return items
    }

    /**
     *
     * @param {import('mongodb').Filter<T>} filter
     */
    function getFilteredItems(filter) {
        const keys = Object.keys(filter)
        const dollarFilters = keys.filter(x => x.startsWith('$'))
        if (dollarFilters.length > 0) {
            throw new NotImplemented('root dollar sign filters not supported')
        }

        /** @type {((item: T) => boolean)[]} */
        const fieldFilter = []
        for (const field of keys) {
            const value = filter[field]
            /**
             * @returns {import('../data/interfaces/mongo_operator.mjs').ImongoOperator[]}
             */
            function getOperators() {
                if (value == null) return ['$eq']
                if (typeof value != 'object') return ['$eq']
                if (Array.isArray(value)) return ['$eq']
                if (value instanceof RegExp) {
                    throw new NotImplemented('Search using a regular expression is not supported')
                }

                // Getting operators used in query
                const fieldInnerKeys = Object.keys(value)
                const operators = fieldInnerKeys.filter(x => x.startsWith('$'))
                const hasOperator = operators.length > 0

                // Lack of operator presumes equal operator
                if (!hasOperator) return ['$eq']

                const areAllKeysOperators = fieldInnerKeys.every(x => x.startsWith('$'))
                if (!areAllKeysOperators) {
                    // Means the object contained operators (such as "$eq" or "$lt"),
                    // But not all keys are operators, which is not valid.
                    throw new Error(`The value on field ${field} does not look right...`)
                }

                // Reading operators from object
                /** @type {import('../data/interfaces/mongo_operator.mjs').ImongoOperator[]} */
                const usedOperators = []
                for (const operator of operators) {
                    switch (operator) {
                        case '$eq':
                            usedOperators.push('$eq')
                        default:
                            throw new NotImplemented(`Operator ${operator} not implemented`)
                    }
                }
                return usedOperators
            }

            const operators = getOperators()
            for (const operator of operators) {
                switch (operator) {
                    case '$eq':
                        fieldFilter.push((doc) => {
                            const savedValue = doc[field]
                            return savedValue == value
                        })
                    default:
                        throw new NotImplemented(`Operator ${operator} is not supported`)
                }
            }
        }

        const allCollectionItems = getItems()
        return allCollectionItems.filter(savedDoc => {
            return fieldFilter.every(comparator => {
                return comparator(savedDoc)
            })
        })
    }

    /**
     * $set
     * @param {*} doc
     * @param {*} update The update object. Should not contain operator
     */
    function performSetUpdate(doc, update) {
        for (const [field, newValue] of Object.entries(update)) {
            doc[field] = newValue
        }
    }

    return {
        async insertOne(doc) {
            const items = getItems()
            if (doc._id == null) {
                // @ts-ignore
                doc._id = new ObjectId()
            }
            items.push(doc)
        },
        async deleteOne(filter) {
            const documentsToDelete = getFilteredItems(filter)
            const allCollectionItems = getItems()

            // Deleting the documents, one document at a time
            while (documentsToDelete.length > 0) {
                const docToDelete = documentsToDelete[0]
                const index = allCollectionItems.indexOf(docToDelete)
                if (index < 0) {
                    throw new Error('Document extracted from memory was not found in memory')
                }
                allCollectionItems.splice(index, 1)
            }
        },
        async updateOne(filter, update) {
            // Getting document to update
            const documentsToUpdate = getFilteredItems(filter)
            if (documentsToUpdate.length == 0) {
                return
            }
            const docToUpdate = documentsToUpdate[0]

            const updateKeys = Object.keys(update)
            const operators = updateKeys.filter(x => x.startsWith('$'))

            // Checking for empty updates
            if (updateKeys.length == 0) {
                return
            }

            // Is a simple $set operation
            if (operators.length == 0) {
                performSetUpdate(docToUpdate, update)
                return
            }

            // Validating update object
            if (updateKeys.length != operators.length) {
                throw new Error('This update does not look right...')
            }

            // Processing complex update
            for (const operator of operators) {
                const value = update[operator]
                switch (operator) {
                    case '$set':
                        performSetUpdate(docToUpdate, value)
                        break
                    default:
                        throw new Error(`Operator ${operator} not supported`)
                }
            }
        }
    }
}