// scripts/seedCards.js
// Run: node scripts/seedCards.js
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
dotenv.config( {path: ".env.local"} )

const uri = process.env.MONGO_URI
if (!uri) throw new Error('MONGO_URI missing in .env.local')

async function run() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  await client.connect()
  const db = client.db('flashcard-frenzy')

  // Simple sample deck
  const deck = {
    deckId: 'deck-general-1',
    name: 'General Knowledge (Sample)',
    description: 'Short deck for demo'
  }

  // Example cards
  const cards = [
    { cardId: 'c1', deckId: deck.deckId, front: 'Capital of France?', back: 'Paris', difficulty: 1 },
    { cardId: 'c2', deckId: deck.deckId, front: '2 + 2 = ?', back: '4', difficulty: 1 },
    { cardId: 'c3', deckId: deck.deckId, front: 'Largest planet in Solar System?', back: 'Jupiter', difficulty: 2 }
  ]

  // Upsert deck
  await db.collection('decks').updateOne(
    { deckId: deck.deckId },
    { $set: deck },
    { upsert: true }
  )

  // Upsert cards
  for (const c of cards) {
    await db.collection('cards').updateOne(
      { cardId: c.cardId },
      { $set: c },
      { upsert: true }
    )
  }

  console.log('Seed complete: deck + cards inserted/updated.')
  await client.close()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
