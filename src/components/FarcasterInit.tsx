'use client';
import { useEffect } from 'react';

export function FarcasterInit() {
  useEffect(() => {
    (async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const isInApp = await sdk.isInMiniApp();
        if (!isInApp) return;
        await sdk.actions.ready();
      } catch {
        // Not in Farcaster mini app - safe to ignore
      }
    })();
  }, []);

  return null;
}
