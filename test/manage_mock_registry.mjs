import { ObjectId } from 'mongodb'
import { after, before } from 'node:test'
import { generateNewId } from '../src/usecases/generate_new_id.mjs'
import { mockGetCollection } from './mock_get_collection.mjs'

/**
 *
 * @param {import('./mock_get_collection.mjs').ItestCollection} param
 */
export function manageMockRegistry({ tag, ...rest } = {}) {

    const id = generateNewId()
    const _id = new ObjectId()

    before(async () => {
        const col = await mockGetCollection()
        await col.insertOne({
            _id,
            createdAt: new Date(),
            tag,
            ...rest,
        })
    })

    after(async () => {
        const col = await mockGetCollection()
        await col.deleteOne({ _id })
    })

    return {
        id
    }
}