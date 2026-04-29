'use client';
import { useEffect } from 'react';

function getGlobalSdk() {
  try {
    if (typeof window !== 'undefined' && (window as any).miniapp?.sdk) {
      return (window as any).miniapp.sdk;
    }
  } catch {}
  return null;
}

export function FarcasterInit() {
  useEffect(() => {
    let done = false;

    const callReady = async () => {
      if (done) return;
      try {
        // Try CDN-loaded SDK first
        let sdk = getGlobalSdk();
        if (!sdk) {
          // Fall back to dynamic import
          const mod = await import('@farcaster/miniapp-sdk');
          sdk = mod.sdk;
        }
        if (sdk && !done) {
          done = true;
          await sdk.actions.ready();
        }
      } catch {
        // ignore
      }
    };

    // Try immediately
    callReady();
    // Retry
    const t1 = setTimeout(callReady, 300);
    const t2 = setTimeout(callReady, 1000);
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
