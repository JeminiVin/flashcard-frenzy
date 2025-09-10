# Flashcard Frenzy Multiplayer 🎮🃏

A real-time multiplayer flashcard game built with **Next.js, Supabase, and MongoDB**.  
Two logged-in players race to answer flashcards — the **first correct answer scores a point**.  
Match history is persisted in MongoDB, and screen-reader announcements provide accessibility.

---

## 🚀 Tech Stack

- **Next.js (App Router)** — frontend & API routes  
- **Supabase** — authentication (magic link), realtime channels (broadcast/subscribe)  
- **MongoDB (Atlas)** — persistence for decks, submissions, winners, and matches  
- **TailwindCSS** — styling  
- **Accessibility** — screen-reader announcements via `aria-live`

---

## ✨ Features

- 🔑 **Auth**: Supabase magic link login (email-based).  
- ⚡ **Realtime**: Supabase channels used for match state + answer results.  
- 🎯 **First Correct Wins**: MongoDB enforces atomic first-correct with a `winners` unique index.  
- 📝 **Persistence**: `cards`, `matches`, `submissions`, `winners` stored in MongoDB.  
- 📖 **History**: `/matches` shows persisted matches, `/matches/[id]` shows details.  
- ♿ **Accessibility**: Announcements via `aria-live` region for screen readers.

---

## ⚙️ Setup & Run Locally

### 1. Clone repo
```bash
git clone https://github.com/<your-username>/flashcard-frenzy.git
cd flashcard-frenzy
