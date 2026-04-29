'use client';
import { LoginButtons } from '@/components/LoginButtons';
import { GameScreen } from '@/components/GameScreen';
import { isTelegram } from '@/lib/platform';
import { useAccount } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';

interface UserInfo {
  platform: string;
  name: string;
  fid?: number;
}

export default function Home() {
  const { isConnected } = useAccount();
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const inApp = await sdk.isInMiniApp();
        if (inApp) {
          setIsFarcaster(true);
          // Get real Farcaster user context
          try {
            const context = await sdk.context;
            const fcUser = context?.user;
            if (fcUser) {
              setUser({
                platform: 'farcaster',
                name: fcUser.displayName || fcUser.username || 'Farcaster User',
                fid: fcUser.fid,
              });
            }
          } catch {}
          // Call ready
          try { await sdk.actions.ready(); } catch {}
          setAuthenticated(true);
        }
      } catch {
        // Not in Farcaster
      }

      // Auto-authenticate Telegram
      if (isTelegram()) {
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser) {
          setUser({
            platform: 'telegram',
            name: tgUser.first_name || 'Player',
          });
          setAuthenticated(true);
        }
      }
    })();
  }, []);

  const handleAuthenticated = useCallback((userInfo?: UserInfo) => {
    if (userInfo) setUser(userInfo);
    setAuthenticated(true);
  }, []);

  const showGame = authenticated || isConnected;

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4">
      {showGame ? <GameScreen user={user} /> : <LoginButtons onAuthenticated={handleAuthenticated} />}
    </div>
  );
}
