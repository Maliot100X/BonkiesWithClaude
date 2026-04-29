import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

export async function verifySiweMessage(
  address: `0x${string}`,
  message: string,
  signature: `0x${string}`,
): Promise<boolean> {
  try {
    return await baseClient.verifyMessage({
      address,
      message,
      signature,
    });
  } catch {
    return false;
  }
}
