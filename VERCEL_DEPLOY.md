# BonkWithClaude - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally `npm i -g vercel`
3. **GitHub/GitLab/Bitbucket**: Repo pushed to a Git provider
4. **Production Domain**: A stable HTTPS domain (no ngrok/tunnels)

---

## Step 1: Configure Environment Variables

In the Vercel dashboard (Settings → Environment Variables), add:

### Required

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` | Your production URL (no trailing slash) |
| `NEXT_PUBLIC_BASE_APP_NAME` | `BonkWithClaude` | App name for Base Account connector |

### Telegram

| Variable | Value | Notes |
|----------|-------|-------|
| `TELEGRAM_BOT_TOKEN` | `123456:ABC-DEF...` | From @BotFather on Telegram |

### Farcaster

| Variable | Value | Notes |
|----------|-------|-------|
| `FARCASTER_DOMAIN` | `your-domain.com` | Domain only (no protocol) |
| `FARCASTER_ACCOUNT_HEADER` | `eyJmaWQiO...` | Generate at [Farcaster Manifest Tool](https://farcaster.xyz/~/developers/mini-apps/manifest) |
| `FARCASTER_ACCOUNT_PAYLOAD` | `eyJkb21ha...` | From manifest tool |
| `FARCASTER_ACCOUNT_SIGNATURE` | `MHg3NmRk...` | From manifest tool |

### Base

| Variable | Value | Notes |
|----------|-------|-------|
| `BASE_API_KEY` | `your-api-key` | From [dashboard.base.org](https://dashboard.base.org) |

---

## Step 2: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Step 3: Deploy via Git Integration (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel auto-detects Next.js — no config needed
5. Add environment variables (Step 1)
6. Click "Deploy"

---

## Step 4: Configure Custom Domain

1. In Vercel dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

---

## Step 5: Verify Deployment

### Farcaster Manifest

```bash
curl https://your-domain.com/.well-known/farcaster.json
```

Should return valid JSON with all required fields.

### Public Images

Verify these URLs resolve:
- `https://your-domain.com/icon.png` (200x200)
- `https://your-domain.com/splash.png` (200x200)
- `https://your-domain.com/og.png` (1200x630)

### API Routes

```bash
# Telegram auth endpoint
curl -X POST https://your-domain.com/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData":"test"}'

# Farcaster auth endpoint
curl -X POST https://your-domain.com/api/auth/farcaster \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test"

# Base auth endpoint
curl -X POST https://your-domain.com/api/auth/base \
  -H "Content-Type: application/json" \
  -d '{"address":"0x...","message":"...","signature":"0x..."}'

# Farcaster webhook endpoint
curl -X POST https://your-domain.com/api/webhook/farcaster \
  -H "Content-Type: application/json" \
  -d '{"event":"miniapp_added"}'
```

---

## Step 6: Register on Platforms

### Farcaster

1. Go to [Farcaster Developer Tools](https://farcaster.xyz/~/settings/developer-tools)
2. Enable Developer Mode
3. Use the [Manifest Tool](https://farcaster.xyz/~/developers/mini-apps/manifest) to generate accountAssociation
4. Update `FARCASTER_ACCOUNT_*` env vars in Vercel
5. Test: Open `https://farcaster.xyz/~/apps/open?domain=your-domain.com`

### Base

1. Go to [base.dev](https://www.base.dev)
2. Register your app with all metadata
3. Add builder code (optional, at Settings → Builder Code)
4. Test: Open your app in Base App

### Telegram

1. Talk to [@BotFather](https://t.me/BotFather) on Telegram
2. Create a new bot or use existing
3. Set menu button: Use `setChatMenuButton` API or BotFather commands
4. Set bot description and profile photo
5. Test: Open via `t.me/yourbotusername/appname`

---

## Step 7: Post-Deploy Checklist

- [ ] `/.well-known/farcaster.json` returns valid JSON
- [ ] All image URLs (icon, splash, og) resolve correctly
- [ ] Telegram script loads in `<head>` before other scripts
- [ ] Farcaster `sdk.actions.ready()` called (no infinite loading)
- [ ] Telegram `ready()` and `expand()` called
- [ ] SIWE flow works (connect wallet → sign → verify)
- [ ] Haptic feedback works on Telegram and Farcaster
- [ ] MainButton and BackButton work on Telegram
- [ ] Share Score button works (composeCast on Farcaster, Web Share on web)
- [ ] CloudStorage saves/loads game state on Telegram
- [ ] Theme syncs correctly (dark/light) on Telegram
- [ ] Notifications webhook receives events on Farcaster

---

## Troubleshooting

### Build Fails

```bash
# Run locally to see errors
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

### Images Not Loading

- Verify files exist in `public/` directory
- Check that URLs in manifest match your domain
- Ensure `Content-Type` is `image/png` (Vercel handles this automatically)

### Farcaster Manifest Not Working

- Check rewrite in `next.config.ts` is correct
- Verify API route at `/api/well-known/farcaster` returns valid JSON
- Check CORS headers are set

### Telegram Init Not Working

- Verify `telegram-web-app.js` loads before your app scripts
- Check that `ready()` is called
- Verify `TELEGRAM_BOT_TOKEN` is set in Vercel env vars

### SIWE Flow Fails

- Ensure wallet is connected to Base (chain ID 8453 or 84532)
- Check that `viem/siwe` imports resolve
- Verify backend `/api/auth/base` endpoint is accessible
