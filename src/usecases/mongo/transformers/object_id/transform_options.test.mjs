import { ObjectId } from 'mongodb'
import assert from 'node:assert'
import { describe, it } from 'node:test'
import { transformOptions } from './transform_options.mjs'

describe('transformOptions', () => {

    const hex = '507f1f77bcf86cd799439011'

    it('returns null/undefined untouched', () => {
        assert.equal(transformOptions(undefined), undefined)
        assert.equal(transformOptions(/** @type {any} */ (null)), null)
    })

    it('converts hex-strings inside arrayFilters', () => {
        const out = /** @type {any} */ (transformOptions({ arrayFilters: [{ 'elem.id': hex }] }))
        assert(out.arrayFilters[0]['elem.id'] instanceof ObjectId)
    })

    it('converts hex-strings inside let, min and max', () => {
        const out = /** @type {any} */ (transformOptions({
            let: { target: hex },
            min: { _id: hex },
            max: { _id: hex },
        }))
        assert(out.let.target instanceof ObjectId)
        assert(out.min._id instanceof ObjectId)
        assert(out.max._id instanceof ObjectId)
    })

    it('converts hex-strings embedded in projection operators', () => {
        const out = /** @type {any} */ (transformOptions({
            projection: { posts: { $elemMatch: { id: hex } } },
        }))
        assert(out.projection.posts.$elemMatch.id instanceof ObjectId)
    })

    it('does not touch metadata fields', () => {
        const options = { upsert: true, returnDocument: 'after', sort: { createdAt: -1 } }
        const out = transformOptions(options)
        assert.equal(out, options)
    })

    it('preserves the caller reference when nothing changes', () => {
        const options = { arrayFilters: [{ 'elem.status': 'active' }], upsert: true }
        const out = transformOptions(options)
        assert.equal(out, options)
    })

    it('does not mutate the caller options', () => {
        const options = { arrayFilters: [{ 'elem.id': hex }] }
        const out = transformOptions(options)
        assert.notEqual(out, options)
        assert.equal(typeof options.arrayFilters[0]['elem.id'], 'string')
    })

    it('leaves special class instances (e.g. session) intact', () => {
        class FakeSession {
            constructor() {
                this.lsid = hex
            }
            endSession() {
                return 'ended'
            }
        }
        const session = new FakeSession()
        const out = /** @type {any} */ (transformOptions({ arrayFilters: [{ 'elem.id': hex }], session }))

        // arrayFilters still converted...
        assert(out.arrayFilters[0]['elem.id'] instanceof ObjectId)
        // ...but the session instance is untouched.
        assert.equal(out.session, session)
        assert(out.session instanceof FakeSession)
        assert.equal(typeof out.session.endSession, 'function')
        assert.equal(typeof out.session.lsid, 'string')
    })
})
