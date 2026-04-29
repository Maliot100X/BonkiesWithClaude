'use client';
import { useEffect, useRef } from 'react';

export function FarcasterInit() {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;

    // Try immediately and on a short delay (SDK may load async)
    const tryReady = async () => {
      if (called.current) return;
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const isInApp = await sdk.isInMiniApp();
        if (isInApp && !called.current) {
          called.current = true;
          await sdk.actions.ready();
        }
      } catch {
        // Not in Farcaster - safe to ignore
      }
    };

    tryReady();
    // Retry after a short delay in case SDK loads late
    const timer = setTimeout(tryReady, 500);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
