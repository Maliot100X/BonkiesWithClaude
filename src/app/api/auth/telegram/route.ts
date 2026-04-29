import { validateTelegramInitData } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const { initData } = await request.json();
    if (!initData || typeof initData !== 'string') {
      return Response.json({ error: 'Missing initData' }, { status: 400 });
    }

    const valid = await validateTelegramInitData(initData);
    if (!valid) {
      return Response.json({ error: 'Invalid initData' }, { status: 401 });
    }

    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    const user = userStr ? JSON.parse(userStr) : null;

    return Response.json({ ok: true, user });
  } catch {
    return Response.json({ error: 'Validation failed' }, { status: 500 });
  }
}
