# Boinkers.io — Product Spec

## Overview

Boinkers.io is a Telegram-based casual game built around a spin wheel mechanic. Players earn coins, XP, and multipliers by spinning a prize wheel, progressing through levels while competing on a global leaderboard. The game leverages Telegram's Mini App platform for frictionless access and social virality.

## Platform & Access

- Runs as a Telegram Mini App (Web App) inside the Telegram client
- Also accessible via standalone web app at boinkers.io
- Login options: Telegram account (primary), Google, Email
- No app install required — loads instantly within Telegram chat

## Main Screen

The main screen is the hub of the experience. Dark theme throughout with vibrant accent colors (neon greens, pinks, yellows) on a near-black background.

### Spin Wheel (Center Stage)

The dominant UI element is a large, circular spin wheel occupying the center of the screen. The wheel is divided into colored segments, each representing a prize tier. A prominent "SPIN" button sits below or overlaid on the wheel. The button pulses with animation to draw attention. Players tap it to trigger a spin — the wheel rotates with a deceleration animation and lands on a segment. Results are displayed with celebratory particle effects and sound.

### Prize Segments

The wheel contains the following prize types:

- **Coins** — Primary currency. Small, medium, and large coin bundles (e.g., 100, 500, 2000).
- **XP** — Experience points that contribute to level progression.
- **Multipliers** — 2x, 5x, 10x applied to the next spin or accumulated coins.
- **Jackpot** — Rare high-value segment with large coin payout.
- **Bonus Spin** — Grants an additional free spin.
- **Nothing / Lose** — The wheel lands on a dead segment; no reward.

### Progress Bar

Above or below the wheel, a horizontal progress bar shows the player's advancement toward the next level. It fills as XP accumulates. The current level number is displayed prominently. Leveling up triggers a visual celebration and may unlock new wheel tiers or rewards.

### Spin Count & Energy System

A spin counter or energy indicator shows remaining free spins. Spins regenerate over time or can be purchased/refilled via coins or in-app purchases. This creates a session rhythm — players return periodically for fresh spins.

## Leaderboard

A leaderboard tab or panel displays ranked players with:

- Player avatar and username
- Current level
- Total coins earned
- Ranking position (1st, 2nd, 3rd with medal icons)

The leaderboard reinforces competition and gives players a reason to keep spinning.

## Inbox

The inbox icon (envelope or bell) in the top navigation bar shows a badge count for unread messages. Inbox items include:

- Reward notifications
- Friend invitations
- System announcements
- Bonus spin offers
- Achievement unlocks

## Navigation

A bottom tab bar provides access to:

- **Home** — Spin wheel (default view)
- **Leaderboard** — Global rankings
- **Inbox** — Messages and notifications
- **Profile** — Account settings, login, stats

## Visual Style

- Dark theme with deep navy/black backgrounds
- Neon accent colors for interactive elements
- Smooth animations on wheel spin, level-ups, and prize reveals
- Particle effects and confetti for big wins
- Clean, minimal UI optimized for mobile screens (Telegram Mini App viewport)

## Social & Viral Mechanics

- Share wins in Telegram chats
- Invite friends for bonus spins
- Friend referral leaderboard
- Group challenges and team rewards

## Technical Notes

- Built as a Telegram Web App (Mini App SDK)
- Responsive mobile-first layout
- State persisted server-side per Telegram user ID
- Real-time leaderboard updates
