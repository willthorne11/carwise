# Carwise 🚗

Stop getting ripped off buying a used car.

## What's built

- `/` — Landing page
- `/shortlist` — 5-step shortlist flow powered by Claude AI
- `/review` — Car review page powered by Claude AI
- `/unlock` — Payment page powered by Stripe

## Getting live in 4 steps

### Step 1 — Add your API keys

Open `.env.local` and replace the placeholders:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (from Stripe dashboard)
STRIPE_SECRET_KEY=sk_live_... (from Stripe dashboard)
ANTHROPIC_API_KEY=sk-ant-... (from console.anthropic.com)
```

You can leave MARKETCHECK_API_KEY and CARCHECK_API_KEY blank for now — the app works without them using AI knowledge alone.

### Step 2 — Push to GitHub

1. Go to github.com and create a free account if you don't have one
2. Create a new repository called "carwise"
3. Download GitHub Desktop from desktop.github.com
4. Open GitHub Desktop, click "Add existing repository"
5. Find the carwise folder on your computer
6. Click "Publish repository"

### Step 3 — Deploy to Vercel

1. Go to vercel.com and sign up with your GitHub account
2. Click "New Project"
3. Import your carwise repository
4. Before clicking deploy, click "Environment Variables"
5. Add each key from your .env.local file
6. Click Deploy

Vercel will give you a URL like carwise.vercel.app — your site is live.

### Step 4 — Connect your domain

1. In Vercel, go to your project settings → Domains
2. Add "carwise.site"
3. Vercel will show you DNS records to add
4. Log into Namecheap, go to your domain, click "Advanced DNS"
5. Add the records Vercel shows you
6. Wait 10-30 minutes — your site will be live at carwise.site

## Stripe — go live

Right now Stripe is in test mode. To take real payments:
1. Complete your Stripe account verification
2. In Stripe dashboard, switch from "Test" to "Live"
3. Copy your live keys (they start with pk_live_ and sk_live_)
4. Update your environment variables in Vercel

## How the AI works

When a user submits a shortlist or review, the app calls the Claude API (claude-opus-4-6) with a structured prompt. Claude returns a JSON object with scores, verdicts, flags, alternatives and all the review data. This is what makes every result feel intelligent and personalised rather than generic.

Cost per search: ~£0.01-0.03. At £7.99 per paying user the margins are huge.

## Free tier limits

Tracked in localStorage (no account needed):
- 1 free shortlist
- 5 free reviews

On hitting the limit, users are redirected to /unlock.

## File structure

```
carwise/
  pages/
    index.js          — Landing page
    shortlist.js      — Shortlist flow
    review.js         — Review flow  
    unlock.js         — Payment page
    api/
      analyse.js      — Claude AI endpoint
      create-payment-intent.js — Stripe endpoint
  components/
    Nav.js            — Navigation
  lib/
    usage.js          — Free tier tracking
  styles/
    globals.css       — Global styles
    Home.module.css
    Shortlist.module.css
    Review.module.css
    Unlock.module.css
  .env.local          — Your API keys (never commit this)
```

## Adding Marketcheck (live listings)

Once you have a Marketcheck API key:
1. Add it to .env.local
2. In pages/api/analyse.js, add a call to the Marketcheck search API before the Claude prompt
3. Pass the live listings into the Claude prompt so it references real available cars

## Questions?

The whole thing was built with Claude. Go back to Claude and describe what you want to change — it can edit any file.
