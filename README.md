# tick/ex

A frontend-only demo of a tokenized ticket exchange. Users can sign up, pass a mock KYC step, set up a fake self-custody wallet, browse events, buy tickets with a simulated payment flow, and resell tickets back to the market.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**. All state lives in `localStorage` — there is no backend.

## Stack

- Next.js 14 (App Router, React Server Components where helpful)
- TypeScript
- Tailwind CSS with a custom dark theme
- Geist + JetBrains Mono (loaded from Google Fonts)

## Run locally

Requires Node.js 18.17+ (any recent version works).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

## Deploy to Vercel

The easiest path:

1. Push this project to a new GitHub repo.
2. Go to [vercel.com](https://vercel.com), click "Add New → Project".
3. Import the repo. Vercel auto-detects Next.js — no config needed.
4. Click **Deploy**. Done.

Or, from the CLI:

```bash
npm i -g vercel
vercel
```

Follow the prompts. Deploy is free on Vercel's hobby tier.

## Flow

```
/login        → sign up or sign in (accepts anything)
/kyc          → upload any image as "ID"
/wallet/create→ generate fake wallet + seed phrase + PIN
/home         → discover events and artists
/event/[id]   → event details, pick tier
/checkout/[id]→ link payment method, sign with PIN, mint ticket
/inventory    → view owned tickets, list for resale
```

## Resetting the demo

Click your avatar (top-right) and select "Sign out / reset demo". This wipes all `localStorage` keys.

## Project structure

```
app/
  login/       Authentication
  kyc/         Identity verification
  wallet/
    create/    Wallet onboarding
  home/        Event discovery
  event/[id]/  Event detail
  checkout/[id]/ Purchase flow
  inventory/   Wallet / resale
  layout.tsx   Root layout
  page.tsx     Redirect-on-state root
  globals.css

components/
  TopNav.tsx
  StepIndicator.tsx

lib/
  store.ts     localStorage helpers + fake crypto utilities
  mockData.ts  Artists and events
```

## Notes on the "wallet"

The wallet is visual only. `generateWalletAddress()` produces a random hex string that looks like an Ethereum address. `generateSeedPhrase()` picks 12 words from a short list. None of this does any real cryptography — it's just there to mimic the feel of setting up a self-custody wallet.

If you ever wanted to make this real, you'd swap the `lib/store.ts` layer for something like ethers.js or viem, and replace the mock ticket state with actual on-chain reads/writes.
