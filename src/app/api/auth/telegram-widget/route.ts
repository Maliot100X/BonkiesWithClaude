import { createHmac } from 'crypto';

export async function POST(request: Request) {
  try {
    const user = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return Response.json({ error: 'Server not configured' }, { status: 500 });
    }

    if (!user || !user.hash || !user.auth_date) {
      return Response.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Verify Telegram Login Widget data
    const { hash, ...data } = user;
    const dataCheckArr = Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`);
    const dataCheckString = dataCheckArr.join('\n');

    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (computedHash !== hash) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Check auth_date is not too old (24 hours)
    const authAge = Math.floor(Date.now() / 1000) - user.auth_date;
    if (authAge > 86400) {
      return Response.json({ error: 'Auth data expired' }, { status: 401 });
    }

    return Response.json({ ok: true, user: { id: user.id, first_name: user.first_name, username: user.username } });
  } catch {
    return Response.json({ error: 'Validation failed' }, { status: 500 });
  }
}
