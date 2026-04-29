import { sdk } from '@farcaster/miniapp-sdk';

export type Platform = 'telegram' | 'farcaster' | 'base' | 'web';

export function detectPlatformSync(): Platform {
  if (typeof window === 'undefined') return 'web';
  if (window.Telegram?.WebApp?.initData) return 'telegram';
  return 'web';
}

export async function detectPlatform(): Promise<Platform> {
  if (typeof window === 'undefined') return 'web';
  if (window.Telegram?.WebApp?.initData) return 'telegram';
  try {
    if (await sdk.isInMiniApp()) return 'farcaster';
  } catch {
    // not in Farcaster
  }
  return 'web';
}

export function isTelegram(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
}

export function isFarcasterContext(context: Record<string, unknown> | null): boolean {
  return context !== null;
}
