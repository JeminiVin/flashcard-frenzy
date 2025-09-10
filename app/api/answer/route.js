// app/api/answer/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../lib/supabaseServer'
import { connectToMongo } from '../../../lib/mongo'

export async function POST(req) {
  try {
    const body = await req.json()
    const { matchId, playerId, cardId, answer, ts } = body ?? {}

    if (!matchId || !playerId || !cardId || answer == null) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    const submitted = String(answer).trim().toLowerCase()
    const tsServer = Date.now()

    // Fetch correct answer from Mongo cards collection
    let correct = null
    try {
      const client = await connectToMongo()
      const db = client.db('flashcard-frenzy')
      const card = await db.collection('cards').findOne({ cardId }, { projection: { back: 1 } })
      if (card && card.back) correct = String(card.back).trim().toLowerCase()
    } catch (err) {
      console.warn('mongo lookup failed for card', cardId, err?.message ?? err)
    }

    // fallback if no card found (this shouldn't happen after seeding)
    if (!correct) {
      // optional fallback answers map (keeps backward compatibility)
      const FALLBACK = { c1: 'paris' }
      correct = FALLBACK[cardId] ?? null
    }

    const isCorrect = !!(correct && submitted === correct)

    // Now, persist submission + perform atomic first-correct (same as earlier)
    const submissionDoc = {
      matchId, cardId, playerId, submitted, isCorrect, tsClient: ts ?? null, tsServer: new Date()
    }

    let finalScores = {}
    let wasWinnerClaimed = false

    try {
      const client = await connectToMongo()
      const session = client.startSession()

      await session.withTransaction(async () => {
        const db = client.db('flashcard-frenzy')

        await db.collection('submissions').insertOne(submissionDoc, { session })

        if (isCorrect) {
          const existing = await db.collection('winners').findOne({ matchId, cardId }, { session })
          if (!existing) {
            await db.collection('winners').insertOne({ matchId, cardId, winnerId: playerId, ts: new Date() }, { session })
            await db.collection('matches').updateOne(
              { matchId },
              {
                $setOnInsert: { matchId, startedAt: new Date() },
                $inc: { [`scores.${playerId}`]: 1 },
                $push: { rounds: { cardId, winnerId: playerId, ts: new Date() } },
                $set: { endedAt: null }
              },
              { upsert: true, session }
            )
            wasWinnerClaimed = true
          } else {
            wasWinnerClaimed = false
          }
        }

        const matchDoc = await db.collection('matches').findOne({ matchId }, { session })
        finalScores = (matchDoc?.scores) ?? {}
      }, {
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
      })

      session.endSession()
    } catch (err) {
      console.error('Mongo transaction error:', err)
    }

    const broadcastPayload = {
      matchId,
      cardId,
      playerId,
      isCorrect,
      submitted,
      tsClient: ts ?? null,
      tsServer,
      announce: isCorrect
        ? (wasWinnerClaimed ? `${playerId} answered correctly! +1` : `${playerId} answered correctly but too late`)
        : `${playerId} answered (incorrect)`,
      scores: finalScores
    }

    try {
      await supabaseServer.channel(`public:match:${matchId}`).send({
        type: 'broadcast',
        event: 'answer_result',
        payload: broadcastPayload
      })
    } catch (err) {
      console.error('Supabase broadcast error:', err)
    }

    return NextResponse.json({ ok: true, result: broadcastPayload })
  } catch (err) {
    console.error('ERROR in /api/answer route:', err && (err.stack || err.message || err))
    return NextResponse.json({ error: 'internal server error', detail: String(err) }, { status: 500 })
  }
}
