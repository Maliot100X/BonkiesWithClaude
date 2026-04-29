export async function POST(request: Request) {
  try {
    const { platform, title, body, targetUrl, tokens, walletAddresses } =
      await request.json();

    switch (platform) {
      case 'telegram': {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
          return Response.json({ error: 'Telegram not configured' }, { status: 500 });
        }
        // Send via Bot API sendMessage
        // In production, store chat IDs and send to each
        return Response.json({ ok: true, platform: 'telegram' });
      }

      case 'farcaster': {
        if (!tokens?.length) {
          return Response.json({ error: 'No tokens' }, { status: 400 });
        }
        // POST to Farcaster notification URL for each token
        const notificationId = `bonk-${Date.now()}`;
        for (const token of tokens) {
          try {
            await fetch(token.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                notificationId,
                title,
                body,
                targetUrl,
                tokens: [token.token || token],
              }),
            });
          } catch {
            // Token may be expired
          }
        }
        return Response.json({ ok: true, platform: 'farcaster' });
      }

      case 'base': {
        const apiKey = process.env.BASE_API_KEY;
        if (!apiKey) {
          return Response.json({ error: 'Base not configured' }, { status: 500 });
        }
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        const res = await fetch('https://dashboard.base.org/api/v1/notifications/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            app_url: appUrl,
            wallet_addresses: walletAddresses,
            title: title.slice(0, 30),
            message: body.slice(0, 200),
            target_path: new URL(targetUrl).pathname,
          }),
        });
        return Response.json({ ok: res.ok, platform: 'base' });
      }

      default:
        return Response.json({ error: 'Unknown platform' }, { status: 400 });
    }
  } catch {
    return Response.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
