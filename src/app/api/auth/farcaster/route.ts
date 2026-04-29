import { verifyFarcasterJwt } from '@/lib/farcaster';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Missing token' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const domain = process.env.FARCASTER_DOMAIN || new URL(request.url).host;

    const result = await verifyFarcasterJwt(token, domain);
    if (!result) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    return Response.json({ ok: true, fid: result.fid });
  } catch {
    return Response.json({ error: 'Validation failed' }, { status: 500 });
  }
}
