# BonkWithClaude - Complete Build Guide

> Generated from telegramDocs.txt, farcasterDocs.txt, baseDocs.txt (April 29, 2026)
> Project: Next.js 16.2.4 + React 19 + Tailwind 4 + TypeScript

---

## Platform Summary

| Platform | Auth | Wallet/Identity | Notifications | SDK |
|----------|------|-----------------|---------------|-----|
| **Telegram** | initData (HMAC-SHA256 validated server-side) | Telegram user ID | Bot API sendMessage | `telegram-web-app.js` (CDN) |
| **Farcaster** | Quick Auth (SIWF JWT) | FID via `sdk.context.user` | POST to notification URL token | `@farcaster/miniapp-sdk` |
| **Base** | SIWE (Sign-In With Ethereum) | Wallet address via wagmi `useAccount()` | Base.dev Notifications API | `wagmi` + `viem` + `@base-org/account` |

---

## Phase 1: Install All Dependencies

```bash
# Farcaster Mini App SDK
npm install @farcaster/miniapp-sdk @farcaster/quick-auth @farcaster/miniapp-node

# Base / Ethereum stack
npm install wagmi viem @tanstack/react-query @base-org/account @base-org/account-ui ox

# Existing (already installed): next, react, react-dom, tailwindcss, typescript
```

**Telegram**: No npm package needed. Load via CDN `<script>` tag in `<head>`.

---

## Phase 2: Project Structure

```
src/
  app/
    layout.tsx          # Root layout (providers, fonts, meta)
    page.tsx            # Landing / login page
    globals.css         # Tailwind + theme variables
    game/
      page.tsx          # Main game screen
    api/
      auth/
        telegram/
          route.ts      # Telegram initData validation
        farcaster/
          route.ts      # Farcaster Quick Auth JWT validation
        base/
          route.ts      # SIWE signature verification
      webhook/
        farcaster/
          route.ts      # Farcaster webhook (notifications enable/disable)
      notifications/
        route.ts        # Send notifications (Telegram + Farcaster + Base)
  components/
    providers.tsx       # wagmi + QueryClient providers
    TelegramInit.tsx    # Telegram WebApp initialization
    FarcasterInit.tsx   # Farcaster SDK ready() + context
    WalletConnect.tsx   # Base wallet connection (SIWE)
    LoginButtons.tsx    # Platform-specific login buttons
    GameScreen.tsx      # Shared game UI
  lib/
    config.ts           # wagmi config (Base chain)
    telegram.ts         # Telegram validation helpers
    farcaster.ts        # Farcaster auth helpers
    base.ts             # Base/SIWE helpers
public/
  icon.png              # App icon (min 200x200, max 1024x1024)
  splash.png            # Splash screen image (200x200)
  og.png                # Open Graph image (3:2 ratio)
```

---

## Phase 3: Root Layout & Providers

### 3a. wagmi Config (`src/lib/config.ts`)

```ts
import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { baseAccount, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    baseAccount({ appName: 'BonkWithClaude' }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
```

### 3b. Providers Component (`src/components/providers.tsx`)

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/config';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 3c. Root Layout (`src/app/layout.tsx`)

- Wrap children with `<Providers>`
- Load Telegram script: `<script src="https://telegram.org/js/telegram-web-app.js?62"></script>` in `<head>` (BEFORE other scripts)
- Add Farcaster preconnect: `<link rel="preconnect" href="https://auth.farcaster.xyz" />`
- Set meta tags for Farcaster embed on game page
- Apply dark theme CSS variables

---

## Phase 4: Theme & CSS

### Design Tokens (from GUIDE.md)

- Primary background: `#0A0F26` (dark navy)
- Fonts: Luckiest Softie (display), Roboto (body)
- Use Telegram CSS variables where available for native feel:
  - `var(--tg-theme-bg-color)` - auto light/dark
  - `var(--tg-theme-text-color)`
  - `var(--tg-theme-button-color)`

### globals.css

```css
@import "tailwindcss";

:root {
  --bg-primary: #0A0F26;
  --text-primary: #ffffff;
  --accent: #FFD700;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Roboto', sans-serif;
  margin: 0;
  min-height: 100vh;
  min-height: var(--tg-viewport-stable-height, 100vh);
}
```

---

## Phase 5: Telegram Integration

### 5a. Frontend Init (`src/components/TelegramInit.tsx`)

```tsx
'use client';
import { useEffect } from 'react';

declare global {
  interface Window { Telegram: any; }
}

export function TelegramInit() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    // Optionally disable closing confirmation for game flow
    // tg.enableClosingConfirmation();
  }, []);
  return null;
}
```

### 5b. Detect Telegram Environment

```ts
export function isTelegram(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
}

export function getTelegramUser() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user;
}
```

### 5c. Server-Side Validation (`src/app/api/auth/telegram/route.ts`)

Validate `initData` using HMAC-SHA256:
1. Parse initData query string
2. Extract `hash`, sort remaining fields alphabetically
3. Create data-check string: `field=value\nfield=value\n...`
4. Compute `HMAC-SHA256(data_check_string, HMAC-SHA256("WebAppData", BOT_TOKEN))`
5. Compare with extracted `hash` using timing-safe comparison

**Env var**: `TELEGRAM_BOT_TOKEN`

### 5d. Telegram Features to Use

| Feature | API | Notes |
|---------|-----|-------|
| Haptic feedback | `Telegram.WebApp.HapticFeedback.impactOccurred('medium')` | On bonk action |
| Theme sync | `var(--tg-theme-*)` CSS variables | Auto dark/light |
| Viewport | `var(--tg-viewport-stable-height)` | For bottom buttons |
| Main button | `Telegram.WebApp.MainButton` | "BONK!" action button |
| Back button | `Telegram.WebApp.BackButton` | Navigation |
| Close confirmation | `enableClosingConfirmation()` | Prevent accidental exit |
| Cloud storage | `Telegram.WebApp.CloudStorage` | Save game state (1024 keys max) |
| Send data to bot | `Telegram.WebApp.sendData()` | Keyboard button mini apps only |

### 5e. Launching the Telegram Mini App

Options (pick one or more):
- **Menu Button**: `setChatMenuButton()` via Bot API - quick access
- **Inline Button**: `web_app` type `InlineKeyboardButton` - full web apps
- **Direct Link**: `t.me/botusername/appname` - shareable
- **Main Mini App**: BotFather setup - primary store listing

### 5f. Telegram Bot Setup

1. Create bot via @BotFather
2. Set menu button or inline keyboard with `web_app` type
3. Set bot description and profile photo
4. For Main Mini App: configure via BotFather

---

## Phase 6: Farcaster Integration

### 6a. SDK Init (`src/components/FarcasterInit.tsx`)

```tsx
'use client';
import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export function FarcasterInit() {
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const isInApp = await sdk.isInMiniApp();
      if (!isInApp) return;
      setContext(await sdk.context);
      await sdk.actions.ready(); // CRITICAL: must call or infinite loading
    })();
  }, []);

  return null; // or pass context via React context
}
```

### 6b. Farcaster Auth - Quick Auth (Frontend)

```tsx
// Option A: Auto-authenticated fetch
const res = await sdk.quickAuth.fetch('/api/auth/farcaster/me');

// Option B: Get token manually
const { token } = await sdk.quickAuth.getToken();
// Use as: Authorization: Bearer ${token}
```

### 6c. Farcaster Auth - Backend Validation (`src/app/api/auth/farcaster/route.ts`)

```bash
npm install @farcaster/quick-auth
```

```ts
import { createClient } from '@farcaster/quick-auth';
const client = createClient();

// In handler:
const payload = await client.verifyJwt({ token: bearerToken, domain: 'your-domain.com' });
// payload.sub = FID
```

### 6d. Farcaster Manifest (`/.well-known/farcaster.json`)

```json
{
  "accountAssociation": {
    "header": "...",    // Generated via https://farcaster.xyz/~/developers/mini-apps/manifest
    "payload": "...",
    "signature": "..."
  },
  "miniapp": {
    "version": "1",
    "name": "BonkWithClaude",
    "iconUrl": "https://your-domain.com/icon.png",
    "homeUrl": "https://your-domain.com",
    "imageUrl": "https://your-domain.com/og.png",
    "buttonTitle": "Play Now",
    "splashImageUrl": "https://your-domain.com/splash.png",
    "splashBackgroundColor": "#0A0F26",
    "webhookUrl": "https://your-domain.com/api/webhook/farcaster",
    "description": "Bonk with Claude on Farcaster!",
    "primaryCategory": "games",
    "tags": ["game", "bonk", "claude"],
    "tagline": "Bonk your way to glory!",
    "noindex": false
  }
}
```

**Or use Farcaster hosted manifest** (redirect `/.well-known/farcaster.json` to `https://api.farcaster.xyz/miniapps/hosted-manifest/YOUR_ID`).

### 6e. Farcaster Webhook (`src/app/api/webhook/farcaster/route.ts`)

Handle events:
- `miniapp_added` - store notification token
- `miniapp_removed` - invalidate token
- `notifications_enabled` - store notification token
- `notifications_disabled` - invalidate token

Verify with `@farcaster/miniapp-node`:
```ts
import { parseWebhookEvent, verifyAppKeyWithNeynar } from "@farcaster/miniapp-node";
const data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
```

### 6f. Send Farcaster Notifications

POST to the notification URL (stored from webhook):
```json
{
  "notificationId": "bonk-result-2026-04-29",
  "title": "You got bonked!",
  "body": "Someone bonked you! Bonk them back!",
  "targetUrl": "https://your-domain.com/game",
  "tokens": ["token1", "token2"]
}
```

Rate limits: 1 per 30s per token, 100 per day per token, batch up to 100.

### 6g. Farcaster Embed Meta Tags (for shareable pages)

```html
<meta property="fc:miniapp" content='{"version":"next","imageUrl":"https://your-domain.com/og.png","button":{"title":"Bonk!","action":{"type":"launch_miniapp","name":"BonkWithClaude","url":"https://your-domain.com/game","splashImageUrl":"https://your-domain.com/splash.png","splashBackgroundColor":"#0A0F26"}}}' />
```

### 6h. Farcaster Social Features

| Feature | SDK Method | Use Case |
|---------|-----------|----------|
| Compose cast | `sdk.actions.composeCast({ text, embeds })` | Share score |
| View cast | `sdk.actions.viewCast({ hash })` | View challenge |
| View profile | `sdk.actions.viewProfile({ fid })` | View opponent |
| Haptics | `sdk.haptics.impactOccurred('medium')` | Bonk feedback |
| Back nav | `sdk.back.show({ fallbackUrl })` | Navigation |

### 6i. Farcaster Wallet (for on-chain actions)

```ts
const provider = await sdk.wallet.getEthereumProvider();
// Works with viem: createWalletClient({ chain: base, transport: custom(provider) })
```

### 6j. Domain Rules

- `www.example.com` != `example.com` (completely separate apps)
- Must use production domain for `addMiniApp()` (no ngrok/tunnels)
- `targetUrl` in notifications must EXACTLY match registered domain
- Choose domain carefully - can't be changed later (use `canonicalDomain` for migration)

---

## Phase 7: Base Integration

### 7a. Base Config (already in `src/lib/config.ts`)

Uses wagmi with Base chain (8453) and BaseAccount connector.

### 7b. Sign In With Ethereum (`src/components/WalletConnect.tsx`)

```tsx
'use client';
import { SignInWithBaseButton } from "@base-org/account-ui/react";
import { useAccount, useSignMessage, usePublicClient } from 'wagmi';
import { createSiweMessage, generateSiweNonce } from 'viem/siwe';

export function WalletConnect() {
  const { address, chainId, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const publicClient = usePublicClient();

  async function signIn() {
    if (!isConnected || !address || !chainId || !publicClient) return;
    const nonce = generateSiweNonce();
    const message = createSiweMessage({
      address, chainId,
      domain: window.location.host,
      nonce,
      uri: window.location.origin,
      version: '1',
    });
    const signature = await signMessageAsync({ message });
    const valid = await publicClient.verifySiweMessage({ message, signature });
    if (valid) { /* authenticated */ }
  }

  return <SignInWithBaseButton colorScheme="dark" onClick={signIn} />;
}
```

### 7c. Base Backend SIWE Verification (`src/app/api/auth/base/route.ts`)

```ts
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({ chain: base, transport: http() });

export async function POST(req: Request) {
  const { address, message, signature } = await req.json();
  const valid = await client.verifyMessage({ address, message, signature });
  if (!valid) return Response.json({ error: 'Invalid' }, { status: 401 });
  return Response.json({ ok: true });
}
```

### 7d. Base Transactions (ERC-20 for in-game tokens)

```tsx
import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';

const { writeContract } = useWriteContract();
writeContract({
  address: '0xTOKEN_ADDRESS',
  abi: ERC20_ABI,
  functionName: 'transfer',
  args: ['0xRecipient', parseUnits('10', 6)],
});
```

### 7e. Base Pay (for purchases)

```ts
import { pay, getPaymentStatus } from '@base-org/account';
const { id } = await pay({ amount: '5.00', to: '0xRecipient', testnet: true });
```

### 7f. Builder Codes (ERC-8021 Attribution)

1. Register at https://base.dev -> Settings -> Builder Code
2. Add to wagmi config:

```ts
import { Attribution } from "ox/erc8021";
const DATA_SUFFIX = Attribution.toDataSuffix({ codes: ["YOUR-BUILDER-CODE"] });

export const config = createConfig({
  // ... existing config
  dataSuffix: DATA_SUFFIX, // auto-appended to all transactions
});
```

### 7g. Base Notifications API

**Base URL**: `https://dashboard.base.org/api/v1/`
**Auth**: `x-api-key` header
**Rate limit**: 10 req/min/IP

Get opted-in users:
```bash
curl "https://dashboard.base.org/api/v1/notifications/app/users?app_url=<url>&notification_enabled=true" \
  -H "x-api-key: <key>"
```

Send notification:
```bash
curl -X POST "https://dashboard.base.org/api/v1/notifications/send" \
  -H "x-api-key: <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "app_url": "<url>",
    "wallet_addresses": ["0x..."],
    "title": "You got bonked!",       # max 30 chars
    "message": "Bonk them back!",     # max 200 chars
    "target_path": "/game"
  }'
```

### 7h. Base.dev Registration

Register app at https://www.base.dev with:
- Name, icon, tagline, description
- Screenshots
- Category: "games"
- Primary URL
- Builder code

### 7i. Deeplinks (replaces deprecated SDK methods)

```ts
window.open(`https://base.app/coin/base-mainnet/${TOKEN_ADDRESS}`); // view token
window.open(`https://base.app/profile/${WALLET_ADDRESS}`);           // view profile
```

---

## Phase 8: Platform Detection & Routing

The app needs to detect which platform it's running on and adapt:

```ts
export type Platform = 'telegram' | 'farcaster' | 'base' | 'web';

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'web';
  if (window.Telegram?.WebApp?.initData) return 'telegram';
  // Check Farcaster (async, but can check user agent hints)
  if (document.referrer.includes('farcaster') || navigator.userAgent.includes('Farcaster')) return 'farcaster';
  return 'base'; // or 'web' if no wallet connected
}
```

### Auth Flow per Platform

| Platform | Frontend Auth | Backend Verify | Session |
|----------|--------------|----------------|---------|
| Telegram | `window.Telegram.WebApp.initData` | HMAC-SHA256 with BOT_TOKEN | Telegram user ID |
| Farcaster | `sdk.quickAuth.getToken()` | `@farcaster/quick-auth` verifyJwt | FID |
| Base | SIWE via wagmi `useSignMessage()` | `viem` verifyMessage | Wallet address |
| Web (fallback) | Email/Google (custom) | Custom | Custom |

---

## Phase 9: Notifications System

### Unified Notification Interface

```ts
interface NotificationPayload {
  title: string;      // max 30 chars (Base), 64 chars (Farcaster)
  body: string;       // max 200 chars (Base), 200 chars (Farcaster)
  targetUrl: string;
  platform: 'telegram' | 'farcaster' | 'base';
}

async function sendNotification(payload: NotificationPayload) {
  switch (payload.platform) {
    case 'telegram':
      // Use Bot API: sendMessage to user's chat
      break;
    case 'farcaster':
      // POST to stored notification URL with token
      break;
    case 'base':
      // POST to Base.dev Notifications API
      break;
  }
}
```

---

## Phase 10: Game Logic

- Core bonk mechanics (tap/click interaction)
- Score tracking and leaderboard
- Haptic feedback on bonk (all platforms support this)
- Save state: Telegram CloudStorage, localStorage for others
- Share results via platform-specific compose actions

---

## Phase 11: Environment Variables

```env
# Telegram
TELEGRAM_BOT_TOKEN=

# Farcaster
FARCASTER_DOMAIN=your-domain.com

# Base
BASE_API_KEY=              # from dashboard.base.org
NEXT_PUBLIC_BASE_APP_NAME=BonkWithClaude

# General
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Phase 12: Deployment (Vercel)

### vercel.json

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

### Required for Production

1. **Domain**: Must be stable, HTTPS, production domain (no tunnels)
2. **Farcaster manifest**: Host `/.well-known/farcaster.json` or redirect to hosted
3. **Base.dev registration**: All metadata filled in
4. **Telegram bot**: Configure via @BotFather with production domain

### Deploy Steps

```bash
vercel --prod
# or
vercel deploy --prod
```

---

## Phase 13: Testing Checklist

### Telegram
- [ ] App loads in Telegram (no infinite loading)
- [ ] `Telegram.WebApp.ready()` called
- [ ] Theme syncs (dark/light)
- [ ] Haptic feedback works
- [ ] MainButton / BackButton work
- [ ] initData validates on server
- [ ] CloudStorage saves/loads game state

### Farcaster
- [ ] `sdk.actions.ready()` called (no infinite loading)
- [ ] Quick Auth works (JWT issued and verified)
- [ ] Manifest loads at `/.well-known/farcaster.json`
- [ ] Embed meta tags render rich cards
- [ ] Notifications webhook receives events
- [ ] `composeCast()` shares score
- [ ] `addMiniApp()` works on production domain
- [ ] Haptics work

### Base
- [ ] wagmi connects to Base chain
- [ ] BaseAccount connector works
- [ ] SIWE flow completes (sign + verify)
- [ ] Wallet address accessible via `useAccount()`
- [ ] Transactions send (if applicable)
- [ ] Builder code appended to txns (if registered)
- [ ] Registered on base.dev

---

## Key Gotchas & Rules

1. **`sdk.actions.ready()` is MANDATORY** on both Telegram and Farcaster - skip = infinite loading
2. **`www.domain.com` != `domain.com`** on Farcaster - completely separate apps
3. **Telegram `initData` must be validated server-side** - never trust `initDataUnsafe`
4. **Farcaster `user` context is untrusted** - use Quick Auth for verified identity
5. **Node.js 22.11.0+** required for Farcaster SDK
6. **Production domain required** for Farcaster search indexing and `addMiniApp()`
7. **Telegram script must load BEFORE other scripts** in `<head>`
8. **Base chain ID**: 8453 (mainnet) / 84532 (Sepolia testnet) / hex `0x2105`
9. **Notification targetUrl** must exactly match registered domain on Farcaster
10. **Farcaster notification rate limit**: 1/30s per token, 100/day per token
11. **Base notification rate limit**: 10 req/min/IP
12. **Deprecated Farcaster SDK methods**: `sendToken` -> `useWriteContract`, `openUrl` -> `window.open()`, `signIn` -> SIWE via wagmi
