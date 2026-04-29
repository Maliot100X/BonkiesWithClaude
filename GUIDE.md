# BonkWithClaude - MANDATORY BUILD GUIDE

## STOP. READ THIS FIRST.

Before writing ANY code, you MUST:
1. Read ALL 3 research docs (telegramDocs.txt, farcasterDocs.txt, baseDocs.txt)
2. Create SETUP_GUIDE.md with EVERY step documented
3. Only THEN start building

## Build Order (DO NOT SKIP)

### Phase 1: Read All Docs
- Read telegramDocs.txt (Telegram Mini Apps)
- Read farcasterDocs.txt (Farcaster Mini Apps)
- Read baseDocs.txt (Base Apps)
- Create SETUP_GUIDE.md summarizing ALL requirements

### Phase 2: Project Setup
- Next.js + Tailwind + TypeScript (already done)
- Install ALL required packages (twa-sdk, @farcaster/miniapp-sdk, wagmi, viem, etc.)
- Verify build works: npm run build

### Phase 3: Theme and Layout
- Dark theme (#0A0F26 primary)
- Custom fonts (Luckiest Softie display, Roboto body)
- Base layout with responsive design
- Test: layout renders correctly

### Phase 4: Landing Page
- Logo + branding (BonkWithClaude)
- Login buttons: Telegram, Email, Google
- reCAPTCHA integration
- Test: page renders, buttons work

### Phase 5: Game UI
- Game screen layout
- Score display
- Action buttons
- Test: UI renders correctly

### Phase 6: Telegram Integration
- TWA SDK setup
- User authentication
- Theme sync
- Test: works in Telegram

### Phase 7: Farcaster Integration
- Mini App SDK
- Quick Auth
- Test: works in Farcaster

### Phase 8: Base Integration
- wagmi + viem setup
- Base Account connector
- Test: wallet connects

### Phase 9: Game Logic
- Core game mechanics
- Score tracking
- Test: game plays correctly

### Phase 10: Vercel Deploy
- vercel.json config
- Environment variables
- Deploy and test

## RULES
1. NEVER skip documentation reading
2. NEVER bulk-create files
3. ALWAYS test after each step
4. If an error occurs, FIX IT before continuing
5. Each step must be COMPLETED and VERIFIED before moving to next
