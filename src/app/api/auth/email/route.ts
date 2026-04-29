import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, code } = await req.json();

  if (code) {
    // Verify code — in production, check against a stored code
    if (!email || !code) {
      return NextResponse.json({ error: 'Missing email or code' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  // Send code — in production, send an actual email
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, message: 'Code sent' });
}
