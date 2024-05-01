This is a small package to improve some things that you, as a developer, have to deal with when working with mongo, like:

- [_id](##_id)
- [ObjectId](##ObjectId)
- [projection](##projection)
- [Connection String](##connection-string)
- [Client Instance](##client-instance)

# Example

```js
import {getCollection} from "assai"

const collection = await getCollection()
const docs = await collection.find({}, {limit: 10})
/**
 * [{id: "507f1f77bcf86cd799439011", name: "Mario"}, ...]
 */
```

## _id

Ever wanted to use just "id" in your collections instead of "_id"?

This package does just that!

Every data that enters the database can, optionally, have an "id". In this case, before sending the data to the native mongodb driver, the object will rename this property to "_id", which mongodb understands. This operation will be applied to `insertOne` and `insertMany` methods.

Also, the methods `updateOne`, `updateMany`, `deleteOne`, `deleteMany`, `findOne` and `find` will also rename the field "id" to "_id".

## ObjectId

Another thing that is related to "_id" fields are the `ObjectId`s.

The issue is that your application can before unnecessarily verbose. To fix that, the package will automatically convert all objectId strings into a ObjectId under the hood and all objectIds that will come from your collection, will be converted to strings.

```js
await collection.insertOne({
    name: "Matteo",
    groupId: "507f1f77bcf86cd799439011" // This will be stored as an ObjectId
})
```

Every time you need a new id, you can call the `id` method:

```js
const myStringId = driver.generateNewId()
```

One example this could be useful is if have an API endpoint that accepts structured data. And you use these values to query the database. Like so:

```js
// Client code
const response = await axios.post('/posts', {
    userId: "507f1f77bcf86cd799439011"
})
```

This is fine, but you will have to convert a `string` into a `ObjectId` for each field value that is an objectId in your collection. Even though this is easy to do, you could forget somewhere.

Instead of carrying this risk, you can use the object as-is and the conversion will be made automatically.

## projection

The projection from the native mongodb driver is fine as it is. But there is one thing that is annoying: it can cause your program to fail.

To be honest, this behavior makes some sense because this usually comes from a mistake the developer made. But this is not always the case and it goes against how mongodb and javascript in general behave: they avoid throwing an exception when possible.

For that reason, you won't see this error while using this package:
```
Cannot do exclusion on field '...' in inclusion projection
```

Making projections like that valid:
```json
{
    "name": true,
    "createdAt": false
}
```

## Connection String

A default environment variable is assumed: DATABASE_URL.

Which makes it easier to start a connection:
```js
const database = await getCollection('myCollection')
```
This will read the value from `process.env.DATABASE_URL`.

You can still pass a custom connection string:
```js
const database = await getCollection('myCollection', {
    cs: 'my connection string',
})
```

## Client Instance

If you ever worked with serverless, you will notice that you shouldn't open and close a connection everytime your function runs. You need to cache it. The package does this caching for you by default.

You could also do this for simplicity, so instead of:
```js
// db.js
let cachedClient = null
export async function getDb () {
    if (cachedClient == null) {
        const client = await MongoClient('...')
        cachedClient = client
    }
    return cachedClient.db()
}

// router.js
import {getDb} from 'db.js'

router.post('/', (req, res) => {
    const db = await getDb()
    const col db.collection('myCollection')
    // ...
})
```

You can simply write:
```js
router.post('/', (req, res) => {
    const col = getCollection('myCollection')
    // Here the connection is opened only if it is not opened already.
    // Further calls to this route won't open a connection.
    await driver.insertOne({
        name: req.body.name,
    })
    // ...
})
```