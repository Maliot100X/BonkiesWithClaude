import { createClient } from '@farcaster/quick-auth';

const client = createClient();

export async function verifyFarcasterJwt(
  token: string,
  domain: string,
): Promise<{ fid: number } | null> {
  try {
    const payload = await client.verifyJwt({ token, domain });
    return { fid: payload.sub };
  } catch {
    return null;
  }
}
