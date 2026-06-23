import { ObjectId } from 'mongodb'
import assert from 'node:assert'
import { describe, it } from 'node:test'
import { stringsIntoId } from './strings_into_id.mjs'

describe('stringsIntoId', () => {

    it('should return null when given null', () => {
        const result = stringsIntoId(null)
        assert.strictEqual(result, null)
    })

    it('should return undefined when given undefined', () => {
        const result = stringsIntoId(undefined)
        assert.strictEqual(result, undefined)
    })

    it('should return primitives unchanged', () => {
        assert.strictEqual(stringsIntoId('hello'), 'hello')
        assert.strictEqual(stringsIntoId(42), 42)
        assert.strictEqual(stringsIntoId(3.14), 3.14)
        assert.strictEqual(stringsIntoId(true), true)
        assert.strictEqual(stringsIntoId(false), false)
    })

    it('should convert a single ObjectId hex string to ObjectId', () => {
        const objectId = new ObjectId()
        const hexString = objectId.toHexString()
        const result = stringsIntoId(hexString)
        assert(result instanceof ObjectId)
        assert.strictEqual(result.toHexString(), hexString)
    })

    it('should NOT mutate the original object with userId property', () => {
        const userId = new ObjectId().toHexString()
        const originalObj = { userId, name: 'John' }
        const originalUserId = originalObj.userId

        const result = stringsIntoId(originalObj)

        // CRITICAL: The original object should NOT be mutated
        assert.strictEqual(originalObj.userId, originalUserId)
        assert.strictEqual(typeof originalObj.userId, 'string')

        // The returned object should have the converted value
        assert(result.userId instanceof ObjectId)
        assert.strictEqual(result.userId.toHexString(), userId)
    })

    it('should NOT mutate the original object when converting nested ObjectId strings', () => {
        const userId = new ObjectId().toHexString()
        const addressId = new ObjectId().toHexString()
        const originalObj = {
            name: 'Jane',
            userId,
            address: {
                id: addressId,
                city: 'New York'
            }
        }
        const originalUserId = originalObj.userId
        const originalAddressId = originalObj.address.id

        const result = stringsIntoId(originalObj)

        // CRITICAL: Original object should NOT be mutated
        assert.strictEqual(originalObj.userId, originalUserId)
        assert.strictEqual(typeof originalObj.userId, 'string')
        assert.strictEqual(originalObj.address.id, originalAddressId)
        assert.strictEqual(typeof originalObj.address.id, 'string')

        // Result should have converted values
        assert(result.userId instanceof ObjectId)
        assert(result.address.id instanceof ObjectId)
        assert.strictEqual(result.userId.toHexString(), userId)
        assert.strictEqual(result.address.id.toHexString(), addressId)
    })

    it('should NOT mutate the original array', () => {
        const id1 = new ObjectId().toHexString()
        const id2 = new ObjectId().toHexString()
        const originalArr = [id1, id2, 'text']
        const originalRef = originalArr

        const result = stringsIntoId(originalArr)

        // For arrays, it clones them, so result should not be the same reference
        // But the original should still be unchanged
        assert.strictEqual(originalArr[0], id1)
        assert.strictEqual(typeof originalArr[0], 'string')
        assert.strictEqual(originalArr[1], id2)
        assert.strictEqual(typeof originalArr[1], 'string')

        // Result should be a new array with converted values
        assert(result[0] instanceof ObjectId)
        assert(result[1] instanceof ObjectId)
        assert.strictEqual(result[2], 'text')
    })

    it('should convert ObjectId hex string in a simple object', () => {
        const objectId = new ObjectId()
        const hexString = objectId.toHexString()
        const obj = { id: hexString, name: 'test' }
        const result = stringsIntoId(obj)
        assert(result.id instanceof ObjectId)
        assert.strictEqual(result.id.toHexString(), hexString)
        assert.strictEqual(result.name, 'test')
    })

    it('should convert multiple ObjectId strings in an object', () => {
        const id1 = new ObjectId()
        const id2 = new ObjectId()
        const obj = { userId: id1.toHexString(), postId: id2.toHexString(), title: 'Post' }
        const result = stringsIntoId(obj)
        assert(result.userId instanceof ObjectId)
        assert(result.postId instanceof ObjectId)
        assert.strictEqual(result.userId.toHexString(), id1.toHexString())
        assert.strictEqual(result.postId.toHexString(), id2.toHexString())
        assert.strictEqual(result.title, 'Post')
    })

    it('should convert ObjectId strings in an array', () => {
        const id1 = new ObjectId()
        const id2 = new ObjectId()
        const arr = [id1.toHexString(), id2.toHexString(), 'text', 42]
        const result = stringsIntoId(arr)
        assert(result[0] instanceof ObjectId)
        assert(result[1] instanceof ObjectId)
        assert.strictEqual(result[2], 'text')
        assert.strictEqual(result[3], 42)
    })

    it('should convert ObjectId strings in nested objects', () => {
        const userId = new ObjectId()
        const addressId = new ObjectId()
        const obj = {
            name: 'John',
            userId: userId.toHexString(),
            address: {
                id: addressId.toHexString(),
                city: 'New York'
            }
        }
        const result = stringsIntoId(obj)
        assert(result.userId instanceof ObjectId)
        assert(result.address.id instanceof ObjectId)
        assert.strictEqual(result.userId.toHexString(), userId.toHexString())
        assert.strictEqual(result.address.id.toHexString(), addressId.toHexString())
        assert.strictEqual(result.address.city, 'New York')
    })

    it('should convert ObjectId strings in arrays within objects', () => {
        const postId1 = new ObjectId()
        const postId2 = new ObjectId()
        const obj = {
            name: 'Jane',
            posts: [
                { id: postId1.toHexString(), title: 'Post 1' },
                { id: postId2.toHexString(), title: 'Post 2' }
            ]
        }
        const result = stringsIntoId(obj)
        assert(result.posts[0].id instanceof ObjectId)
        assert(result.posts[1].id instanceof ObjectId)
        assert.strictEqual(result.posts[0].id.toHexString(), postId1.toHexString())
        assert.strictEqual(result.posts[1].id.toHexString(), postId2.toHexString())
        assert.strictEqual(result.posts[0].title, 'Post 1')
    })

    it('should convert ObjectId strings in objects within arrays', () => {
        const userId1 = new ObjectId()
        const userId2 = new ObjectId()
        const arr = [
            { userId: userId1.toHexString(), name: 'Alice' },
            { userId: userId2.toHexString(), name: 'Bob' }
        ]
        const result = stringsIntoId(arr)
        assert(result[0].userId instanceof ObjectId)
        assert(result[1].userId instanceof ObjectId)
        assert.strictEqual(result[0].userId.toHexString(), userId1.toHexString())
        assert.strictEqual(result[1].userId.toHexString(), userId2.toHexString())
    })

    it('should handle deeply nested structures', () => {
        const deepId = new ObjectId()
        const obj = {
            level1: {
                level2: {
                    level3: {
                        id: deepId.toHexString(),
                        value: 'deep'
                    }
                }
            }
        }
        const result = stringsIntoId(obj)
        assert(result.level1.level2.level3.id instanceof ObjectId)
        assert.strictEqual(result.level1.level2.level3.id.toHexString(), deepId.toHexString())
        assert.strictEqual(result.level1.level2.level3.value, 'deep')
    })

    it('should handle mixed null and ObjectId string values in an object', () => {
        const id = new ObjectId()
        const obj = {
            id: id.toHexString(),
            nullValue: null,
            name: 'test'
        }
        const result = stringsIntoId(obj)
        assert(result.id instanceof ObjectId)
        assert.strictEqual(result.id.toHexString(), id.toHexString())
        assert.strictEqual(result.nullValue, null)
        assert.strictEqual(result.name, 'test')
    })

    it('should handle mixed undefined and ObjectId string values in an object', () => {
        const id = new ObjectId()
        const obj = {
            id: id.toHexString(),
            name: 'test',
            undefinedValue: undefined
        }
        const result = stringsIntoId(obj)
        assert(result.id instanceof ObjectId)
        assert.strictEqual(result.id.toHexString(), id.toHexString())
        assert.strictEqual(result.undefinedValue, undefined)
    })

    it('should handle empty objects', () => {
        const obj = {}
        const result = stringsIntoId(obj)
        assert.deepStrictEqual(result, {})
    })

    it('should handle empty arrays', () => {
        /** @type {*[]} */
        const arr = []
        const result = stringsIntoId(arr)
        assert.deepStrictEqual(result, [])
    })

    it('should handle objects with only non-ObjectId-string properties', () => {
        const obj = { name: 'test', age: 25, active: true, email: 'test@example.com' }
        const originalObj = { ...obj }
        const result = stringsIntoId(obj)
        assert.deepStrictEqual(result, originalObj)
    })

    it('should NOT mutate deeply nested object structures', () => {
        const userId = new ObjectId().toHexString()
        const postId = new ObjectId().toHexString()
        const commentId = new ObjectId().toHexString()

        const originalObj = {
            userId,
            posts: [
                {
                    id: postId,
                    comments: [
                        { id: commentId, text: 'Nice!' }
                    ]
                }
            ]
        }

        // Store original values for comparison
        const originalUserId = originalObj.userId
        const originalPostId = originalObj.posts[0].id
        const originalCommentId = originalObj.posts[0].comments[0].id

        const result = stringsIntoId(originalObj)

        // CRITICAL: Verify original object was NOT mutated
        assert.strictEqual(originalObj.userId, originalUserId)
        assert.strictEqual(typeof originalObj.userId, 'string')
        assert.strictEqual(originalObj.posts[0].id, originalPostId)
        assert.strictEqual(typeof originalObj.posts[0].id, 'string')
        assert.strictEqual(originalObj.posts[0].comments[0].id, originalCommentId)
        assert.strictEqual(typeof originalObj.posts[0].comments[0].id, 'string')

        // Verify result has converted values
        assert(result.userId instanceof ObjectId)
        assert(result.posts[0].id instanceof ObjectId)
        assert(result.posts[0].comments[0].id instanceof ObjectId)
    })

    it('should handle array with mixed types including ObjectId strings', () => {
        const id1 = new ObjectId()
        const id2 = new ObjectId()
        const arr = [
            'string',
            42,
            null,
            id1.toHexString(),
            { nested: id2.toHexString() },
            ['nested-array-string']
        ]
        const result = stringsIntoId(arr)
        assert.strictEqual(result[0], 'string')
        assert.strictEqual(result[1], 42)
        assert.strictEqual(result[2], null)
        assert(result[3] instanceof ObjectId)
        assert.strictEqual(result[3].toHexString(), id1.toHexString())
        assert(result[4].nested instanceof ObjectId)
        assert.strictEqual(result[4].nested.toHexString(), id2.toHexString())
        assert.strictEqual(result[5][0], 'nested-array-string')
    })

    it('should handle objects with numeric string keys', () => {
        const id = new ObjectId()
        const obj = {
            '0': id.toHexString(),
            '1': 'text',
            name: 'test'
        }
        const result = stringsIntoId(obj)
        assert(result['0'] instanceof ObjectId)
        assert.strictEqual(result['0'].toHexString(), id.toHexString())
        assert.strictEqual(result['1'], 'text')
        assert.strictEqual(result.name, 'test')
    })

    it('should handle objects with underscore-prefixed property names like _id', () => {
        const id = new ObjectId()
        const obj = {
            '_id': id.toHexString(),
            '_internal': 'value',
            'regular': 'data'
        }
        const result = stringsIntoId(obj)
        assert(result._id instanceof ObjectId)
        assert.strictEqual(result._id.toHexString(), id.toHexString())
        assert.strictEqual(result._internal, 'value')
        assert.strictEqual(result.regular, 'data')
    })

    it('should not convert invalid ObjectId hex strings', () => {
        const obj = {
            validId: new ObjectId().toHexString(),
            invalidId: 'not-a-valid-object-id',
            email: 'user@example.com'
        }
        const result = stringsIntoId(obj)
        assert(result.validId instanceof ObjectId)
        assert.strictEqual(result.invalidId, 'not-a-valid-object-id')
        assert.strictEqual(result.email, 'user@example.com')
    })

    it('should handle complex real-world document structure', () => {
        const userId = new ObjectId()
        const postId1 = new ObjectId()
        const postId2 = new ObjectId()
        const commentId = new ObjectId()
        const doc = {
            userId: userId.toHexString(),
            username: 'johndoe',
            email: 'john@example.com',
            posts: [
                {
                    postId: postId1.toHexString(),
                    title: 'First Post',
                    comments: [
                        {
                            commentId: commentId.toHexString(),
                            author: 'jane',
                            text: 'Great post!'
                        }
                    ]
                },
                {
                    postId: postId2.toHexString(),
                    title: 'Second Post',
                    comments: []
                }
            ],
            metadata: {
                createdAt: new Date(),
                updatedAt: new Date()
            }
        }

        const originalUserId = doc.userId
        const originalPostId1 = doc.posts[0].postId
        const originalPostId2 = doc.posts[1].postId
        const originalCommentId = doc.posts[0].comments[0].commentId

        const result = stringsIntoId(doc)

        // CRITICAL: Verify original was not mutated
        assert.strictEqual(doc.userId, originalUserId)
        assert.strictEqual(doc.posts[0].postId, originalPostId1)
        assert.strictEqual(doc.posts[1].postId, originalPostId2)
        assert.strictEqual(doc.posts[0].comments[0].commentId, originalCommentId)

        // Verify result has correct conversions
        assert(result.userId instanceof ObjectId)
        assert.strictEqual(result.userId.toHexString(), userId.toHexString())
        assert(result.posts[0].postId instanceof ObjectId)
        assert.strictEqual(result.posts[0].postId.toHexString(), postId1.toHexString())
        assert(result.posts[1].postId instanceof ObjectId)
        assert.strictEqual(result.posts[1].postId.toHexString(), postId2.toHexString())
        assert(result.posts[0].comments[0].commentId instanceof ObjectId)
        assert.strictEqual(result.posts[0].comments[0].commentId.toHexString(), commentId.toHexString())
        assert.strictEqual(result.username, 'johndoe')
        assert(result.metadata.createdAt instanceof Date)
    })

    it('should NOT mutate when converting ObjectId in _id field', () => {
        const id = new ObjectId().toHexString()
        const obj = { _id: id, name: 'Document' }
        const originalId = obj._id

        const result = stringsIntoId(obj)

        // CRITICAL: Original should not be mutated
        assert.strictEqual(obj._id, originalId)
        assert.strictEqual(typeof obj._id, 'string')

        // Result should have converted value
        assert(result._id instanceof ObjectId)
        assert.strictEqual(result._id.toHexString(), id)
    })

    it('should handle Date objects without conversion', () => {
        const id = new ObjectId()
        const now = new Date()
        const obj = {
            userId: id.toHexString(),
            createdAt: now
        }
        const result = stringsIntoId(obj)
        assert(result.userId instanceof ObjectId)
        assert.strictEqual(result.createdAt, now)
        assert(result.createdAt instanceof Date)
    })

    it('should preserve reference equality for non-ObjectId-string values', () => {
        const obj1 = { name: 'nested' }
        const obj = {
            nested: obj1,
            other: 'value'
        }
        const result = stringsIntoId(obj)
        // The nested object should be the same reference
        assert.strictEqual(result.nested, obj1)
    })

    it('should NOT mutate array elements when they are objects', () => {
        const id = new ObjectId().toHexString()
        const objInArray = { userId: id, name: 'test' }
        const originalUserId = objInArray.userId
        const arr = [objInArray]

        const result = stringsIntoId(arr)

        // Original array should not be mutated
        assert.strictEqual(arr[0].userId, originalUserId)
        assert.strictEqual(typeof arr[0].userId, 'string')

        // Result should have converted values
        assert(result[0].userId instanceof ObjectId)
        assert.strictEqual(result[0].userId.toHexString(), id)
    })
})
