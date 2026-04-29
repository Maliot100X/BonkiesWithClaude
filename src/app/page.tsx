'use client';
import { LoginButtons } from '@/components/LoginButtons';
import { GameScreen } from '@/components/GameScreen';
import { isTelegram } from '@/lib/platform';
import { useAccount } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';

export default function Home() {
  const { isConnected } = useAccount();
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const inApp = await sdk.isInMiniApp();
        setIsFarcaster(inApp);
      } catch {
        // Not in Farcaster
      }
    })();
  }, []);

  const handleAuthenticated = useCallback(() => {
    setAuthenticated(true);
  }, []);

  const showGame = authenticated || isConnected || isFarcaster || isTelegram();

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4">
      {showGame ? <GameScreen /> : <LoginButtons onAuthenticated={handleAuthenticated} />}
    </div>
  );
}
