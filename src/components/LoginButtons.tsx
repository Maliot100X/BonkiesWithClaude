'use client';
import { useState, useEffect, useRef } from 'react';
import { WalletConnect } from './WalletConnect';
import { isTelegram } from '@/lib/platform';

interface TelegramWidgetUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface LoginButtonsProps {
  onAuthenticated?: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function LoginButtons({ onAuthenticated }: LoginButtonsProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!widgetRef.current || isTelegram()) return;
    const botUsername = 'BonkiesWithClaudeBot';
    const container = widgetRef.current;

    // Load Telegram Login Widget script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    container.appendChild(script);

    // Define global callback
    (window as unknown as Record<string, unknown>).onTelegramAuth = async (user: TelegramWidgetUser) => {
      try {
        const res = await fetch('/api/auth/telegram-widget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
        if (res.ok) {
          onAuthenticated?.();
        }
      } catch {
        // ignore
      }
    };

    return () => {
      container.innerHTML = '';
      delete (window as unknown as Record<string, unknown>).onTelegramAuth;
    };
  }, [onAuthenticated]);

  async function handleFarcasterLogin() {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      const { token } = await sdk.quickAuth.getToken();
      const res = await fetch('/api/auth/farcaster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        onAuthenticated?.();
      }
    } catch {
      // Not in Farcaster
    }
  }

  async function handleTelegramLogin() {
    if (!isTelegram()) return;
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) return;
    const res = await fetch('/api/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    });
    if (res.ok) {
      onAuthenticated?.();
    }
  }

  async function handleSendCode() {
    setEmailError('');
    if (!email || !email.includes('@')) {
      setEmailError('Enter a valid email');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setCodeSent(true);
      } else {
        setEmailError('Failed to send code');
      }
    } catch {
      setEmailError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!code || code.length < 4) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (res.ok) {
        onAuthenticated?.();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 items-center w-full max-w-xs">
      {/* Play as Guest - primary CTA like Boinkers */}
      <button
        onClick={() => onAuthenticated?.()}
        className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 active:scale-95"
      >
        Play as Guest
      </button>

      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-xs">or sign in</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Google login */}
      <button
        onClick={() => {
          // Google login placeholder - requires Google Client ID
          // In production, use Google Identity Services
          onAuthenticated?.();
        }}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors border border-gray-300"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </button>

      {/* Email login */}
      <div className="w-full flex flex-col gap-2">
        {!codeSent ? (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            {emailError && <p className="text-red-400 text-xs">{emailError}</p>}
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </>
        ) : (
          <>
            <p className="text-white/60 text-sm text-center">Code sent to {email}</p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              maxLength={6}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--accent)] transition-colors text-center tracking-widest text-lg"
            />
            <button
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              onClick={() => { setCodeSent(false); setCode(''); }}
              className="text-white/40 text-xs hover:text-white/60 transition-colors"
            >
              Use a different email
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-xs">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {isTelegram() ? (
        <button
          onClick={handleTelegramLogin}
          className="w-full px-6 py-3 bg-[#0088cc] text-white rounded-lg font-medium hover:bg-[#006da3] transition-colors"
        >
          Play with Telegram
        </button>
      ) : (
        <div ref={widgetRef} className="flex justify-center" />
      )}
      <button
        onClick={handleFarcasterLogin}
        className="w-full px-6 py-3 bg-[#8B5CF6] text-white rounded-lg font-medium hover:bg-[#7C3AED] transition-colors"
      >
        Play with Farcaster
      </button>
      <WalletConnect onSuccess={onAuthenticated} />
    </div>
  );
}
