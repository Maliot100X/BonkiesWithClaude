#!/bin/bash
# BonkWithClaude - Real Setup Script
# This script helps you configure all real API keys

set -e

echo "============================================"
echo "  BonkWithClaude - Real Setup"
echo "============================================"
echo ""

ENV_FILE=".env.local"

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
  cp .env.example "$ENV_FILE" 2>/dev/null || touch "$ENV_FILE"
fi

echo "STEP 1: Telegram Bot"
echo "--------------------"
echo "1. Open Telegram and message @BotFather"
echo "2. Send /newbot"
echo "3. Name it 'BonkWithClaude'"
echo "4. Copy the bot token"
echo ""
read -p "Enter your Telegram Bot Token (or press Enter to skip): " TG_TOKEN
if [ -n "$TG_TOKEN" ]; then
  sed -i "s|^TELEGRAM_BOT_TOKEN=.*|TELEGRAM_BOT_TOKEN=$TG_TOKEN|" "$ENV_FILE"
  if ! grep -q "TELEGRAM_BOT_TOKEN=" "$ENV_FILE"; then
    echo "TELEGRAM_BOT_TOKEN=$TG_TOKEN" >> "$ENV_FILE"
  fi
  echo "  -> Telegram bot token saved!"
fi
echo ""

echo "STEP 2: Farcaster Account Association"
echo "--------------------------------------"
echo "1. Go to https://farcaster.xyz/~/settings/developer-tools"
echo "2. Enable Developer Mode"
echo "3. Go to https://farcaster.xyz/~/developers/mini-apps/manifest"
echo "4. Enter your domain (e.g. bonkwithclaude.vercel.app)"
echo "5. Sign with your wallet"
echo "6. Copy the header, payload, and signature"
echo ""
read -p "Enter your domain (e.g. bonkwithclaude.vercel.app): " FC_DOMAIN
if [ -n "$FC_DOMAIN" ]; then
  sed -i "s|^FARCASTER_DOMAIN=.*|FARCASTER_DOMAIN=$FC_DOMAIN|" "$ENV_FILE"
  if ! grep -q "FARCASTER_DOMAIN=" "$ENV_FILE"; then
    echo "FARCASTER_DOMAIN=$FC_DOMAIN" >> "$ENV_FILE"
  fi
  echo "  -> Domain saved!"
fi

read -p "Enter Farcaster account header: " FC_HEADER
read -p "Enter Farcaster account payload: " FC_PAYLOAD
read -p "Enter Farcaster account signature: " FC_SIG

if [ -n "$FC_HEADER" ]; then
  sed -i "s|^FARCASTER_ACCOUNT_HEADER=.*|FARCASTER_ACCOUNT_HEADER=$FC_HEADER|" "$ENV_FILE"
  if ! grep -q "FARCASTER_ACCOUNT_HEADER=" "$ENV_FILE"; then
    echo "FARCASTER_ACCOUNT_HEADER=$FC_HEADER" >> "$ENV_FILE"
  fi
fi
if [ -n "$FC_PAYLOAD" ]; then
  sed -i "s|^FARCASTER_ACCOUNT_PAYLOAD=.*|FARCASTER_ACCOUNT_PAYLOAD=$FC_PAYLOAD|" "$ENV_FILE"
  if ! grep -q "FARCASTER_ACCOUNT_PAYLOAD=" "$ENV_FILE"; then
    echo "FARCASTER_ACCOUNT_PAYLOAD=$FC_PAYLOAD" >> "$ENV_FILE"
  fi
fi
if [ -n "$FC_SIG" ]; then
  sed -i "s|^FARCASTER_ACCOUNT_SIGNATURE=.*|FARCASTER_ACCOUNT_SIGNATURE=$FC_SIG|" "$ENV_FILE"
  if ! grep -q "FARCASTER_ACCOUNT_SIGNATURE=" "$ENV_FILE"; then
    echo "FARCASTER_ACCOUNT_SIGNATURE=$FC_SIG" >> "$ENV_FILE"
  fi
fi
echo "  -> Farcaster credentials saved!"
echo ""

echo "STEP 3: Base API Key"
echo "--------------------"
echo "1. Go to https://www.base.dev"
echo "2. Create account and register your app"
echo "3. Get API key from Settings"
echo ""
read -p "Enter your Base API Key (or press Enter to skip): " BASE_KEY
if [ -n "$BASE_KEY" ]; then
  sed -i "s|^BASE_API_KEY=.*|BASE_API_KEY=$BASE_KEY|" "$ENV_FILE"
  if ! grep -q "BASE_API_KEY=" "$ENV_FILE"; then
    echo "BASE_API_KEY=$BASE_KEY" >> "$ENV_FILE"
  fi
  echo "  -> Base API key saved!"
fi
echo ""

echo "STEP 4: App URL"
echo "---------------"
read -p "Enter your production URL (e.g. https://bonkwithclaude.vercel.app): " APP_URL
if [ -n "$APP_URL" ]; then
  sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$APP_URL|" "$ENV_FILE"
  if ! grep -q "NEXT_PUBLIC_APP_URL=" "$ENV_FILE"; then
    echo "NEXT_PUBLIC_APP_URL=$APP_URL" >> "$ENV_FILE"
  fi
  echo "  -> App URL saved!"
fi
echo ""

echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "Your .env.local has been configured."
echo ""
echo "Next steps:"
echo "  1. Run: npm run build"
echo "  2. Run: npm run dev (to test locally)"
echo "  3. Deploy: vercel --prod"
echo ""
echo "After deployment, verify:"
echo "  - Farcaster: curl https://your-domain.com/.well-known/farcaster.json"
echo "  - Telegram: Open via t.me/yourbotusername/appname"
echo "  - Base: Register at base.dev with your domain"
echo ""
