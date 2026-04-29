import { verifySiweMessage } from '@/lib/base';
import { isAddress } from 'viem';

export async function POST(request: Request) {
  try {
    const { address, message, signature } = await request.json();

    if (!address || !message || !signature) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (!isAddress(address)) {
      return Response.json({ error: 'Invalid address' }, { status: 400 });
    }

    const valid = await verifySiweMessage(address, message, signature);
    if (!valid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    return Response.json({ ok: true, address });
  } catch {
    return Response.json({ error: 'Validation failed' }, { status: 500 });
  }
}
