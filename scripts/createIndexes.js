// scripts/createIndexes.js
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
dotenv.config({path: ".env.local"})

const uri = process.env.MONGO_URI
if (!uri) throw new Error('MONGO_URI missing')

async function run() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  await client.connect()
  const db = client.db('flashcard-frenzy')
  await db.collection('winners').createIndex({ matchId: 1, cardId: 1 }, { unique: true })
  await db.collection('submissions').createIndex({ matchId: 1, cardId: 1 })
  await db.collection('matches').createIndex({ matchId: 1 }, { unique: true })
  console.log('Indexes created.')
  await client.close()
}
run().catch(err => { console.error(err); process.exit(1) })
