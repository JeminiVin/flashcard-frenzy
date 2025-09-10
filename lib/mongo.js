// lib/mongo.js
import { MongoClient } from 'mongodb'

const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
  console.warn('MONGO_URI not set; Mongo persistence disabled.')
}

let cached = global._mongo
if (!cached) cached = global._mongo = { client: null }

export async function connectToMongo() {
  if (!MONGO_URI) throw new Error('MONGO_URI not configured in .env.local')
  if (cached.client) return cached.client
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  await client.connect()
  cached.client = client
  return client
}
