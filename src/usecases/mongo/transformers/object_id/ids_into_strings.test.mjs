import { ObjectId } from 'mongodb'
import assert from 'node:assert'
import { describe, it } from 'node:test'
import { idsIntoString } from './ids_into_strings.mjs'

describe('idsIntoString', () => {

    it('should return null when given null', () => {
        const result = idsIntoString(null)
        assert.strictEqual(result, null)
    })

    it('should return undefined when given undefined', () => {
        const result = idsIntoString(undefined)
        assert.strictEqual(result, undefined)
    })

    it('should return primitives unchanged', () => {
        assert.strictEqual(idsIntoString('hello'), 'hello')
        assert.strictEqual(idsIntoString(42), 42)
        assert.strictEqual(idsIntoString(3.14), 3.14)
        assert.strictEqual(idsIntoString(true), true)
        assert.strictEqual(idsIntoString(false), false)
    })

    it('should convert a single ObjectId to hex string', () => {
        const objectId = new ObjectId()
        const hexString = objectId.toHexString()
        const result = idsIntoString(objectId)
        assert.strictEqual(result, hexString)
    })

    it('should convert ObjectId in a simple object', () => {
        const objectId = new ObjectId()
        const hexString = objectId.toHexString()
        const obj = { id: objectId, name: 'test' }
        const result = idsIntoString(obj)
        assert.strictEqual(result.id, hexString)
        assert.strictEqual(result.name, 'test')
    })

    it('should convert multiple ObjectIds in an object', () => {
        const id1 = new ObjectId()
        const id2 = new ObjectId()
        const obj = { userId: id1, postId: id2, title: 'Post' }
        const result = idsIntoString(obj)
        assert.strictEqual(result.userId, id1.toHexString())
        assert.strictEqual(result.postId, id2.toHexString())
        assert.strictEqual(result.title, 'Post')
    })

    it('should convert ObjectIds in an array', () => {
        const id1 = new ObjectId()
        const id2 = new ObjectId()
        const arr = [id1, id2, 'text', 42]
        const result = idsIntoString(arr)
        assert.strictEqual(result[0], id1.toHexString())
        assert.strictEqual(result[1], id2.toHexString())
        assert.strictEqual(result[2], 'text')
        assert.strictEqual(result[3], 42)
    })

    it('should convert ObjectIds in nested objects', () => {
        const userId = new ObjectId()
        const addressId = new ObjectId()
        const obj = {
            name: 'John',
            userId,
            address: {
                id: addressId,
                city: 'New York'
            }
        }
        const result = idsIntoString(obj)
        assert.strictEqual(result.userId, userId.toHexString())
        assert.strictEqual(result.address.id, addressId.toHexString())
        assert.strictEqual(result.address.city, 'New York')
    })

    it('should convert ObjectIds in arrays within objects', () => {
        const postId1 = new ObjectId()
        const postId2 = new ObjectId()
        const obj = {
            name: 'Jane',
            posts: [
                { id: postId1, title: 'Post 1' },
                { id: postId2, title: 'Post 2' }
            ]
        }
        const result = idsIntoString(obj)
        assert.strictEqual(result.posts[0].id, postId1.toHexString())
        assert.strictEqual(result.posts[1].id, postId2.toHexString())
        assert.strictEqual(result.posts[0].title, 'Post 1')
    })

    it('should convert ObjectIds in objects within arrays', () => {
        const userId1 = new ObjectId()
        const userId2 = new ObjectId()
        const arr = [
            { userId: userId1, name: 'Alice' },
            { userId: userId2, name: 'Bob' }
        ]
        const result = idsIntoString(arr)
        assert.strictEqual(result[0].userId, userId1.toHexString())
        assert.strictEqual(result[1].userId, userId2.toHexString())
    })

    it('should handle deeply nested structures', () => {
        const deepId = new ObjectId()
        const obj = {
            level1: {
                level2: {
                    level3: {
                        id: deepId,
                        value: 'deep'
                    }
                }
            }
        }
        const result = idsIntoString(obj)
        assert.strictEqual(result.level1.level2.level3.id, deepId.toHexString())
        assert.strictEqual(result.level1.level2.level3.value, 'deep')
    })

    it('should handle mixed null and ObjectId values in an object', () => {
        const id = new ObjectId()
        const obj = {
            id,
            nullValue: null,
            name: 'test'
        }
        const result = idsIntoString(obj)
        assert.strictEqual(result.id, id.toHexString())
        assert.strictEqual(result.nullValue, null)
        assert.strictEqual(result.name, 'test')
    })

    it('should handle mixed undefined and ObjectId values in an object', () => {
        const id = new ObjectId()
        const obj = {
            id,
            name: 'test',
            undefinedValue: undefined
        }
        const result = idsIntoString(obj)
        assert.strictEqual(result.id, id.toHexString())
        assert.strictEqual(result.undefinedValue, undefined)
    })

    it('should modify the original object in place', () => {
        const id = new ObjectId()
        const obj = { id, name: 'test' }
        const result = idsIntoString(obj)
        assert.strictEqual(result, obj)
        assert.strictEqual(obj.id, id.toHexString())
    })

    it('should modify the original array in place', () => {
        const id = new ObjectId()
        const arr = [id, 'text']
        const result = idsIntoString(arr)
        assert.strictEqual(result, arr)
        assert.strictEqual(arr[0], id.toHexString())
    })

    it('should handle empty objects', () => {
        const obj = {}
        const result = idsIntoString(obj)
        assert.deepStrictEqual(result, {})
    })

    it('should handle empty arrays', () => {
        /** @type {*[]} */
        const arr = []
        const result = idsIntoString(arr)
        assert.deepStrictEqual(result, [])
    })

    it('should handle objects with only non-ObjectId properties', () => {
        const obj = { name: 'test', age: 25, active: true }
        const result = idsIntoString(obj)
        assert.deepStrictEqual(result, obj)
    })

    it('should handle duck-typing with _bsontype property', () => {
        // Simulate an ObjectId from a different package instance
        const fakeObjectId = {
            _bsontype: 'ObjectId',
            toHexString() {
                return '507f1f77bcf86cd799439011'
            }
        }
        const result = idsIntoString(fakeObjectId)
        assert.strictEqual(result, '507f1f77bcf86cd799439011')
    })

    it('should not convert objects with _bsontype that is not ObjectId', () => {
        const fakeValue = {
            _bsontype: 'Decimal128',
            value: 'something'
        }
        const result = idsIntoString(fakeValue)
        assert.deepStrictEqual(result, fakeValue)
    })

    it('should handle complex real-world document structure', () => {
        const userId = new ObjectId()
        const postId1 = new ObjectId()
        const postId2 = new ObjectId()
        const commentId = new ObjectId()
        const doc = {
            userId,
            username: 'johndoe',
            posts: [
                {
                    postId: postId1,
                    title: 'First Post',
                    comments: [
                        {
                            commentId,
                            author: 'jane',
                            text: 'Great post!'
                        }
                    ]
                },
                {
                    postId: postId2,
                    title: 'Second Post',
                    comments: []
                }
            ],
            metadata: {
                createdAt: new Date(),
                updatedAt: new Date()
            }
        }
        const result = idsIntoString(doc)
        assert.strictEqual(result.userId, userId.toHexString())
        assert.strictEqual(result.posts[0].postId, postId1.toHexString())
        assert.strictEqual(result.posts[1].postId, postId2.toHexString())
        assert.strictEqual(result.posts[0].comments[0].commentId, commentId.toHexString())
        assert.strictEqual(result.username, 'johndoe')
        assert(result.metadata.createdAt instanceof Date)
    })

    it('should handle array with mixed types including ObjectIds', () => {
        const id1 = new ObjectId()
        const id2 = new ObjectId()
        const arr = [
            'string',
            42,
            null,
            id1,
            { nested: id2 },
            [id1.toHexString()]
        ]
        const result = idsIntoString(arr)
        assert.strictEqual(result[0], 'string')
        assert.strictEqual(result[1], 42)
        assert.strictEqual(result[2], null)
        assert.strictEqual(result[3], id1.toHexString())
        assert.strictEqual(result[4].nested, id2.toHexString())
        assert.strictEqual(result[5][0], id1.toHexString())
    })

    it('should handle objects with numeric string keys', () => {
        const id = new ObjectId()
        const obj = {
            '0': id,
            '1': 'text',
            name: 'test'
        }
        const result = idsIntoString(obj)
        assert.strictEqual(result['0'], id.toHexString())
        assert.strictEqual(result['1'], 'text')
        assert.strictEqual(result.name, 'test')
    })

    it('should handle objects with underscore-prefixed property names', () => {
        const id = new ObjectId()
        const obj = {
            '_id': id,
            '_internal': 'value',
            'regular': 'data'
        }
        const result = idsIntoString(obj)
        assert.strictEqual(result._id, id.toHexString())
        assert.strictEqual(result._internal, 'value')
        assert.strictEqual(result.regular, 'data')
    })
})
