'use client';
import { useEffect, useRef } from 'react';

export function FarcasterInit() {
  const readyCalled = useRef(false);

  useEffect(() => {
    if (readyCalled.current) return;

    const init = async () => {
      try {
        // Dynamic import so it doesn't crash outside Farcaster
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const isInApp = await sdk.isInMiniApp();
        if (isInApp && !readyCalled.current) {
          readyCalled.current = true;
          await sdk.actions.ready();
        }
      } catch {
        // Not in Farcaster - this is fine
      }
    };

    // Call immediately
    init();

    // Also try after a delay in case SDK loads late
    const timer = setTimeout(async () => {
      if (readyCalled.current) return;
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const isInApp = await sdk.isInMiniApp();
        if (isInApp && !readyCalled.current) {
          readyCalled.current = true;
          await sdk.actions.ready();
        }
      } catch {
        // ignore
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
