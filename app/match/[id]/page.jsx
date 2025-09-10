// app/match/[id]/page.jsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { useAuth } from '../../providers'

export default function MatchPage() {
  const router = useRouter()
  const params = useParams()            // client-safe way to read route params
  const id = params?.id ?? 'UNKNOWN'
  const user = useAuth()
  const [state, setState] = useState({ matchId: id, players: [], card: null, scores: {} })
  const [answer, setAnswer] = useState('')
  const [announce, setAnnounce] = useState('')
  const channelRef = useRef(null)

  useEffect(() => {
    if (!id) return
    const ch = supabase.channel(`public:match:${id}`)
    ch.on('broadcast', { event: 'match_state' }, ({ payload }) => {
      setState(prev => ({ ...prev, ...payload }))
      setAnnounce(payload?.announce ?? '')
    })
    ch.on('broadcast', { event: 'answer_result' }, ({ payload }) => {
      setAnnounce(payload.announce)
      setState(prev => ({ ...prev, scores: payload.scores ?? prev.scores }))
    })
    ch.subscribe()
    channelRef.current = ch

    // announce join to others (best-effort)
    supabase.channel(`public:match:${id}`).send({
      type: 'broadcast',
      event: 'player_join',
      payload: { id: user?.id ?? 'anon', email: user?.email ?? 'guest' }
    }).catch(()=>{})

    return () => {
      try { ch.unsubscribe() } catch (e) {}
    }
  }, [id, user])

  async function createMatchAsHost() {
  // ensure user loaded
  if (!user) { alert('Please sign in to create match'); return }
  const hostId = user.id
  const hostName = user.email ?? 'host'
  const payload = { matchId: id, hostId, hostName, deckId: 'deck-general-1' }

  try {
    const res = await fetch('/api/match/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const txt = await res.text()
      console.error('create match error', res.status, txt)
      alert('Could not create match: ' + res.status)
      return
    }
    const data = await res.json()
    // state will be broadcast and also returned; we can set local state optimistically
    setState(prev => ({ ...prev, ...data.state }))
    setAnnounce(data.state?.announce ?? 'Match created')
  } catch (err) {
    console.error('network error creating match', err)
    alert('Network error creating match')
  }
}


  async function submitAnswer() {
  if (!answer) return
  const payload = {
    matchId: id,
    playerId: user?.id ?? 'anon:' + (user?.email ?? 'guest'),
    cardId: state.card?.id ?? 'c1', // adapt to your card id source
    answer,
    ts: Date.now()
  }

  try {
    const res = await fetch('/api/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) {
      console.error('server reject', data)
      alert('Error submitting answer')
    } else {
      setAnswer('')
    }
  } catch (err) {
    console.error(err)
  }
}


  return (
    <div className="p-6">
      <h2 className="text-xl">Match: {id}</h2>
      <div role="status" aria-live="polite" className="sr-only">{announce}</div>

      <div className="mt-4">
        <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(state, null, 2)}</pre>
      </div>

      <div className="mt-4 space-x-2">
        <button
          onClick={createMatchAsHost}
          className="btn"
          disabled={!user}            // disable until user is loaded (prevents user.id null)
        >
          Create match (host)
        </button>

        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer"
          className="border px-2 py-1"
        />

        <button onClick={submitAnswer} className="btn" disabled={!user && !state.card}>
          Submit answer
        </button>
      </div>

      <div className="mt-6">
        <button onClick={() => router.push('/')} className="btn">Back</button>
      </div>
    </div>
  )
}
