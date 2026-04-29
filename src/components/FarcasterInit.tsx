'use client';
import { useEffect } from 'react';

export function FarcasterInit() {
  useEffect(() => {
    let done = false;

    const callReady = async () => {
      if (done) return;
      try {
        const mod = await import('@farcaster/miniapp-sdk');
        const isIn = await mod.sdk.isInMiniApp();
        if (isIn && !done) {
          done = true;
          await mod.sdk.actions.ready();
        }
      } catch {
        // ignore
      }
    };

    // Try immediately
    callReady();

    // Try again after 300ms
    const t1 = setTimeout(callReady, 300);
    // Try again after 1s
    const t2 = setTimeout(callReady, 1000);
    // Try again after 2s
    const t3 = setTimeout(callReady, 2000);

    return () => {
      done = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return null;
}
