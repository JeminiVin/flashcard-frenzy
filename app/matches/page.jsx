// app/matches/page.jsx
import { connectToMongo } from '../../lib/mongo'

export default async function MatchesPage() {
  let matches = []
  try {
    const client = await connectToMongo()
    matches = await client.db('flashcard-frenzy')
      .collection('matches')
      .find({})
      .sort({ startedAt: -1 })
      .limit(50)
      .toArray()
  } catch (err) {
    console.error('failed to load matches', err)
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Match History</h1>
      <p className="mt-2 text-sm text-gray-600">Persisted matches from Mongo</p>
      <ul className="mt-4 space-y-3">
        {matches.map(m => (
          <li key={m.matchId} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-semibold">{m.matchId}</div>
                <div className="text-sm text-gray-700">Started: {m.startedAt ? new Date(m.startedAt).toLocaleString() : '—'}</div>
              </div>
              <div className="text-sm">
                <a href={`/matches/${m.matchId}`} className="underline">View</a>
              </div>
            </div>
            <div className="mt-2 text-sm">Scores: {m.scores ? JSON.stringify(m.scores) : '{}'}</div>
            <div className="mt-1 text-sm">Rounds: {m.rounds ? m.rounds.length : 0}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
