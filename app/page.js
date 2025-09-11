// app/page.jsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [debug, setDebug] = useState(null)
  const [debugOpen, setDebugOpen] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        const userRes = await supabase.auth.getUser()
        const sessionRes = await supabase.auth.getSession()
        if (!mounted) return
        setUser(userRes?.data?.user ?? null)
        setDebug({ userRes: userRes?.data ?? null, sessionRes: sessionRes?.data ?? null })
      } catch (err) {
        console.error('auth load error', err)
        setDebug({ error: String(err) })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setDebug(prev => ({ ...prev, lastEvent: _event, session }))
    })

    return () => {
      mounted = false
      try { sub.data.subscription.unsubscribe() } catch (e) {}
    }
  }, [])

  async function signInWithEmail() {
    const email = prompt('Enter your email for magic link:')
    if (!email) return
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert('Sign-in error: ' + error.message)
    else alert('Magic link sent — check your email and click the link.')
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      <header className="max-w-5xl mx-auto px-6 md:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-indigo-600 text-white w-10 h-10 flex items-center justify-center shadow">
            <span className="font-semibold">FF</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Flashcard Frenzy</h1>
            <p className="text-xs text-slate-500">Realtime multiplayer flashcards — first correct scores.</p>
          </div>
        </div>

        <nav className="flex items-center space-x-3">
          <a href="/matches" className="text-sm px-3 py-2 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">Matches</a>
          <a href="/docs" className="text-sm px-3 py-2 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">Docs</a>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="text-sm text-slate-600">{user.email}</div>
              <button onClick={signOut} className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300">
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={signInWithEmail} className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              Sign in (magic link)
            </button>
          )}
        </nav>
      </header>

      <section className="max-w-5xl mx-auto px-6 md:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">Race to answer — <span className="text-indigo-600">first correct</span> scores a point</h2>
          <p className="text-lg text-slate-600">Create or join a match, get the flashcard at the same time as your opponent, and race to be the first to answer correctly. Accessible live announcements included.</p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { if (!user) return alert('Sign in first'); window.location.href = '/match/TEST123' }}
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
              aria-disabled={!user}
            >
              {user ? 'Join TEST123 match' : 'Sign in to join'}
            </button>

            <button
              onClick={() => {
                if (!user) return alert('Sign in first')
                const code = Math.random().toString(36).slice(2, 8).toUpperCase()
                window.location.href = `/match/${code}`
              }}
              className="px-5 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              Create random match
            </button>

            <a href="/matches" className="px-4 py-3 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">View match history</a>
          </div>

          <div className="mt-4 p-4 bg-white border rounded-lg shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700">How scoring works</h4>
            <p className="text-sm text-slate-600 mt-1">Answers are validated server-side and the first correct submission is recorded in the database. This prevents race conditions and cheating.</p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Your account</div>
                {loading ? (
                  <div className="mt-2 text-sm">Loading…</div>
                ) : user ? (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold">
                      {user?.email?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{user.email}</div>
                      <div className="text-xs text-slate-500">User id: <span className="font-mono">{user.id}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-600">Not signed in</div>
                )}
              </div>
              <div>
                <button onClick={() => setDebugOpen(d => !d)} aria-expanded={debugOpen} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 focus:ring-2 focus:ring-indigo-200">Debug</button>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h4 className="text-sm font-semibold text-slate-700">Quick actions</h4>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <button onClick={() => window.location.href = '/matches'} className="text-sm text-left px-3 py-2 rounded hover:bg-slate-50">🏁 See match history</button>
              <button onClick={() => window.location.href = '/docs'} className="text-sm text-left px-3 py-2 rounded hover:bg-slate-50">📚 Read docs</button>
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Copied current URL') }} className="text-sm text-left px-3 py-2 rounded hover:bg-slate-50">🔗 Copy link</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h5 className="text-sm font-semibold">Accessibility</h5>
            <p className="text-xs text-slate-600 mt-1">Important events are announced via a screen-reader live region on the match page.</p>
          </div>
        </aside>
      </section>

      <footer className="max-w-5xl mx-auto px-6 md:px-8 py-6 text-center text-xs text-slate-500">
        Built with ❤️ — Next.js · Supabase · MongoDB · TailwindCSS
      </footer>

      {debugOpen && (
        <div className="fixed right-5 bottom-5 w-96 max-h-[60vh] overflow-auto bg-white border shadow-lg rounded-lg p-4 z-50">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-semibold">Debug</div>
            <button onClick={() => setDebugOpen(false)} className="text-sm px-2 py-1 rounded bg-slate-100">Close</button>
          </div>
          <pre className="text-xs bg-slate-50 p-2 rounded">{JSON.stringify(debug, null, 2)}</pre>
        </div>
      )}
    </main>
  )
}
