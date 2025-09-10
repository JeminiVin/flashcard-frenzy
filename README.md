
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
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 623f60e (Initial commit from Create Next App)
