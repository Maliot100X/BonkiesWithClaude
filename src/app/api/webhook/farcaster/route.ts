import { parseWebhookEvent, verifyAppKeyWithNeynar } from '@farcaster/miniapp-node';

// In-memory store for demo; use a database in production
const notificationTokens = new Map<number, { token: string; url: string }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await parseWebhookEvent(body, verifyAppKeyWithNeynar);

    switch (data.event.event) {
      case 'miniapp_added':
        break;

      case 'miniapp_removed':
        notificationTokens.delete(data.fid);
        break;

      case 'notifications_enabled':
        notificationTokens.set(data.fid, data.event.notificationDetails);
        break;

      case 'notifications_disabled':
        notificationTokens.delete(data.fid);
        break;
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Invalid webhook' }, { status: 400 });
  }
}
