# BonkWithClaude

A spin-wheel casual game built as a Mini App for Telegram, Farcaster, and Base.

## Features

- Spin wheel with 12 segments (coins, XP, multipliers, jackpot, bonus, nothing)
- Combo system with multipliers (up to 5x at 50+ combo)
- Level progression with XP and titles
- Daily rewards with streak tracking
- Energy system (1 per second regeneration)
- Daily challenges with bonus rewards
- Shop (energy refills, boosts, cosmetics)
- Referral system (invite friends for bonus coins)
- Leaderboard
- Sound effects (Web Audio API)
- Haptic feedback (Telegram + Farcaster)
- Particle effects and floating text animations

## Platform Integrations

### Telegram Mini App
- Full Telegram WebApp SDK integration
- Theme syncing, MainButton, BackButton, closing confirmation
- CloudStorage for game state persistence
- HMAC-SHA256 initData validation
- Haptic feedback

### Farcaster Mini App
- Quick Auth JWT verification
- `sdk.actions.ready()` for proper loading
- `composeCast` for sharing scores
- Webhook events (miniapp_added/removed, notifications)
- Manifest at `/.well-known/farcaster.json`

### Base Wallet
- SIWE (Sign-In with Ethereum) authentication
- BaseAccount connector via wagmi
- Base chain (8453) and BaseSepolia (84532)

## Setup

1. Copy `.env.example` to `.env.local`
2. Configure your environment variables:
   - `TELEGRAM_BOT_TOKEN` — from @BotFather
   - `FARCASTER_DOMAIN` — your production domain
   - `FARCASTER_ACCOUNT_*` — from farcaster.xyz manifest tool
   - `BASE_API_KEY` — from dashboard.base.org
   - `NEXT_PUBLIC_APP_URL` — your production URL
3. `npm install`
4. `npm run dev`

## Deploy

```bash
npm run build
vercel --prod
```

After deployment:
1. Set Telegram bot Mini App URL via BotFather
2. Generate Farcaster account association at farcaster.xyz
3. Register at base.dev with your domain
