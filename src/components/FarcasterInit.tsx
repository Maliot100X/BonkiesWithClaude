'use client';
import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export function FarcasterInit() {
  const [context, setContext] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const isInApp = await sdk.isInMiniApp();
        if (!isInApp) return;
        const ctx = await sdk.context;
        setContext(ctx as Record<string, unknown>);
        await sdk.actions.ready();
      } catch {
        // Not in Farcaster mini app
      }
    })();
  }, []);

  return null;
}
