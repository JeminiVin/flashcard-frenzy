// app/api/match/create/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../../lib/supabaseServer'
import { connectToMongo } from '../../../../lib/mongo'

export async function POST(req) {
  try {
    const body = await req.json()
    const { matchId, hostId, hostName, deckId = 'deck-general-1' } = body ?? {}

    if (!matchId || !hostId) {
      return NextResponse.json({ error: 'matchId and hostId required' }, { status: 400 })
    }

    // connect to mongo, find a card for the deck
    let card = null
    try {
      const client = await connectToMongo()
      const db = client.db('flashcard-frenzy')
      // simple: pick first card (or random)
      card = await db.collection('cards').findOne({ deckId }, { projection: { _id: 0, cardId: 1, front: 1 } })
      if (!card) {
        // fallback to a placeholder if no card found
        card = { cardId: 'c1', front: 'Capital of France?' }
      }

      // create initial match document (upsert)
      const matchDoc = {
        matchId,
        deckId,
        players: [{ id: hostId, name: hostName }],
        scores: { [hostId]: 0 },
        rounds: [],
        startedAt: new Date(),
        endedAt: null
      }
      await db.collection('matches').updateOne({ matchId }, { $set: matchDoc }, { upsert: true })
    } catch (err) {
      console.warn('mongo error in create match:', err?.message ?? err)
      // fallback: set a default card
      if (!card) card = { cardId: 'c1', front: 'Capital of France?' }
    }

    // Build match_state to broadcast
    const state = {
      matchId,
      players: [{ id: hostId, name: hostName }],
      card: { id: card.cardId, front: card.front },
      scores: { [hostId]: 0 },
      announce: `Match ${matchId} created by ${hostName}`
    }

    // broadcast
    await supabaseServer.channel(`public:match:${matchId}`).send({
      type: 'broadcast',
      event: 'match_state',
      payload: state
    })

    return NextResponse.json({ ok: true, state })
  } catch (err) {
    console.error('error in /api/match/create:', err)
    return NextResponse.json({ error: 'server error', detail: String(err) }, { status: 500 })
  }
}
