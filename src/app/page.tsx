'use client';
import { LoginButtons } from '@/components/LoginButtons';
import { GameScreen } from '@/components/GameScreen';
import { isTelegram } from '@/lib/platform';
import { useAccount } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';

export default function Home() {
  const { isConnected } = useAccount();
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [fcReady, setFcReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const inApp = await sdk.isInMiniApp();
        if (inApp) {
          setIsFarcaster(true);
          // Also call ready() here as extra safety
          try { await sdk.actions.ready(); } catch {}
          setFcReady(true);
        }
      } catch {
        // Not in Farcaster
      }
    })();
  }, []);

  const handleAuthenticated = useCallback(() => {
    setAuthenticated(true);
  }, []);

  const showGame = authenticated || isConnected || isFarcaster || isTelegram();

  // In Farcaster, don't wait for fcReady - show game immediately
  // ready() is called by FarcasterInit, the inline script, and here
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4">
      {showGame ? <GameScreen /> : <LoginButtons onAuthenticated={handleAuthenticated} />}
    </div>
  );
}
