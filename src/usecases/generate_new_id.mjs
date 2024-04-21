import { ObjectId } from 'mongodb'

export function generateNewId() {
    return new ObjectId().toHexString()
}