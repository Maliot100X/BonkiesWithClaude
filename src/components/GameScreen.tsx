'use client';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

let fcSdkCache: typeof import('@farcaster/miniapp-sdk').sdk | null = null;
async function getFcSdk() {
  if (fcSdkCache) return fcSdkCache;
  try {
    const mod = await import('@farcaster/miniapp-sdk');
    fcSdkCache = mod.sdk;
    return mod.sdk;
  } catch {
    return null;
  }
}

import {
  GameState,
  getDefaultState,
  loadState,
  saveState,
  loadFromTelegram,
  addXp,
  getMultiplier,
  refillEnergy,
  checkDailyReward,
  claimDailyReward,
  getLevelTitle,
  saveLeaderboardEntry,
  getLeaderboard,
  LeaderboardEntry,
  SHOP_ITEMS,
  ShopItem,
  purchaseItem,
  applyReferralCode,
  useReferralBonus,
  initDailyChallenges,
  updateChallengeProgress,
  claimChallengeReward,
} from '@/lib/gameState';
import { playSpin, playSpinWin, playCombo, playLevelUp, playReward, playEmpty } from '@/lib/sounds';
import { detectPlatformSync, type Platform } from '@/lib/platform';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

type Tab = 'game' | 'stats' | 'leaderboard' | 'inbox' | 'shop' | 'referral' | 'challenges';

const PARTICLE_COLORS = ['#00E676', '#FF4081', '#FFD700', '#00B0FF', '#D500F9', '#FF6B35', '#FF1744'];

interface WheelSegment {
  label: string;
  emoji: string;
  color: string;
  textColor: string;
  type: 'coins' | 'xp' | 'multiplier' | 'jackpot' | 'bonus' | 'nothing';
  value: number;
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  { label: '100', emoji: '🪙', color: '#00E676', textColor: '#0A0F26', type: 'coins', value: 100 },
  { label: '10 XP', emoji: '✨', color: '#9333EA', textColor: '#ffffff', type: 'xp', value: 10 },
  { label: '500', emoji: '💰', color: '#FF6B35', textColor: '#ffffff', type: 'coins', value: 500 },
  { label: 'NOTHING', emoji: '💨', color: '#374151', textColor: '#6B7280', type: 'nothing', value: 0 },
  { label: '2000', emoji: '🪙', color: '#FF4081', textColor: '#ffffff', type: 'coins', value: 2000 },
  { label: '25 XP', emoji: '✨', color: '#3B82F6', textColor: '#ffffff', type: 'xp', value: 25 },
  { label: 'JACKPOT', emoji: '💎', color: '#FFD700', textColor: '#0A0F26', type: 'jackpot', value: 10000 },
  { label: 'BONUS', emoji: '🎁', color: '#00B0FF', textColor: '#0A0F26', type: 'bonus', value: 1 },
  { label: '5x', emoji: '🔥', color: '#D500F9', textColor: '#ffffff', type: 'multiplier', value: 5 },
  { label: '50 XP', emoji: '🌟', color: '#7C3AED', textColor: '#ffffff', type: 'xp', value: 50 },
  { label: '2x', emoji: '⚡', color: '#FF1744', textColor: '#ffffff', type: 'multiplier', value: 2 },
  { label: '10x', emoji: '🚀', color: '#FF4081', textColor: '#ffffff', type: 'multiplier', value: 10 },
];

const SPIN_DURATION = 4000;
const WHEEL_SIZE = 280;

const WEIGHTS = [25, 18, 12, 15, 8, 6, 0.5, 5, 1, 3, 10, 0.3];

export function GameScreen() {
  const [state, setState] = useState<GameState>(getDefaultState);
  const [initialized, setInitialized] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number; color: string }[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showReward, setShowReward] = useState<{ show: boolean; amount: number }>({ show: false, amount: 0 });
  const [tab, setTab] = useState<Tab>('game');
  const [platform, setPlatform] = useState<Platform>('web');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [spinResult, setSpinResult] = useState<WheelSegment | null>(null);
  const [referralInput, setReferralInput] = useState('');
  const [referralMsg, setReferralMsg] = useState('');
  const [shopMsg, setShopMsg] = useState('');
  const particleId = useRef(0);
  const floatId = useRef(0);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlatform(detectPlatformSync());
    const init = async () => {
      let loaded = loadState();
      const tgState = await loadFromTelegram();
      if (tgState && tgState.totalSpins > loaded.totalSpins) {
        loaded = tgState;
      }
      loaded = checkDailyReward(loaded);
      loaded = refillEnergy(loaded);
      loaded = initDailyChallenges(loaded);
      const { state: refState } = useReferralBonus(loaded);
      loaded = refState;
      loaded.sessionsPlayed += 1;
      setState(loaded);
      setInitialized(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    saveState(state);
  }, [state, initialized]);

  useEffect(() => {
    if (!initialized) return;
    const interval = setInterval(() => {
      setState((prev) => {
        const next = refillEnergy(prev);
        return next.energy !== prev.energy ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [initialized]);

  useEffect(() => {
    if (state.combo === 0) return;
    if (comboTimer.current) clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => {
      setState((prev) => ({ ...prev, combo: 0 }));
    }, 2000);
    return () => {
      if (comboTimer.current) clearTimeout(comboTimer.current);
    };
  }, [state.combo]);

  useEffect(() => {
    if (tab === 'leaderboard') {
      setLeaderboard(getLeaderboard());
    }
  }, [tab]);

  const spawnParticles = useCallback((x: number, y: number, count: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        id: particleId.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        size: 3 + Math.random() * 5,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    const id = floatId.current++;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 1000);
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;
    const frame = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1,
            life: p.life - 0.03,
            size: p.size * 0.97,
          }))
          .filter((p) => p.life > 0)
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [particles]);

  const spin = useCallback(() => {
    if (spinning) return;

    setState((prev) => {
      if (prev.energy <= 0) {
        playEmpty();
        return prev;
      }

      const totalWeight = WEIGHTS.reduce((a, b) => a + b, 0);
      let r = Math.random() * totalWeight;
      let segmentIndex = 0;
      for (let i = 0; i < WEIGHTS.length; i++) {
        r -= WEIGHTS[i];
        if (r <= 0) { segmentIndex = i; break; }
      }

      const segment = WHEEL_SEGMENTS[segmentIndex];
      const segmentAngle = 360 / WHEEL_SEGMENTS.length;
      const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2;
      const extraSpins = 5 + Math.floor(Math.random() * 3);
      const targetAngle = extraSpins * 360 + (360 - segmentCenter);

      setTimeout(() => {
        setSpinning(true);
        setSpinResult(null);
        setSpinAngle((prev) => prev + targetAngle);
      }, 0);

      const newState = {
        ...prev,
        energy: prev.energy - 1,
        totalSpins: prev.totalSpins + 1,
      };

      playSpin();

      if (platform === 'telegram' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
      getFcSdk().then(s => s?.haptics.impactOccurred('medium')).catch(() => {});

      setTimeout(() => {
        setState((innerPrev) => {
          const newCombo = innerPrev.combo + 1;
          const comboMult = getMultiplier(newCombo);

          let scoreGain = 0;
          let xpGain = 0;
          let energyGain = 0;
          let resultText = '';
          let resultColor = '#FFD700';

          const boostMult = innerPrev.activeBoost.spinsLeft > 0 ? innerPrev.activeBoost.multiplier : 1;

          if (segment.type === 'coins') {
            scoreGain = Math.floor(segment.value * comboMult * boostMult);
            xpGain = Math.floor(segment.value / 10) + 1;
            resultText = `+${scoreGain} coins`;
            resultColor = '#00E676';
          } else if (segment.type === 'xp') {
            xpGain = segment.value;
            resultText = `+${segment.value} XP`;
            resultColor = '#9333EA';
          } else if (segment.type === 'multiplier') {
            scoreGain = Math.floor(100 * comboMult * segment.value * boostMult);
            xpGain = 10;
            resultText = `${segment.value}x BOOST! +${scoreGain}`;
            resultColor = '#D500F9';
          } else if (segment.type === 'jackpot') {
            scoreGain = Math.floor(segment.value * comboMult * boostMult);
            xpGain = 100;
            resultText = `JACKPOT! +${scoreGain}`;
            resultColor = '#FFD700';
          } else if (segment.type === 'bonus') {
            energyGain = 3;
            xpGain = 5;
            resultText = `BONUS! +3 spins`;
            resultColor = '#00B0FF';
          } else if (segment.type === 'nothing') {
            scoreGain = 0;
            xpGain = 0;
            resultText = `Better luck next time!`;
            resultColor = '#6B7280';
          }

          let updatedState: GameState = {
            ...innerPrev,
            score: innerPrev.score + scoreGain,
            totalScore: innerPrev.totalScore + scoreGain,
            combo: newCombo,
            maxCombo: Math.max(innerPrev.maxCombo, newCombo),
            bestCombo: Math.max(innerPrev.bestCombo, newCombo),
            energy: Math.min(innerPrev.maxEnergy, innerPrev.energy + energyGain),
            activeBoost: innerPrev.activeBoost.spinsLeft > 0
              ? { multiplier: innerPrev.activeBoost.multiplier, spinsLeft: innerPrev.activeBoost.spinsLeft - 1 }
              : innerPrev.activeBoost,
          };

          updatedState = updateChallengeProgress(updatedState, 1, scoreGain, newCombo, 0);

          if (xpGain > 0) {
            const { state: xpState, leveledUp } = addXp(updatedState, xpGain);
            updatedState = xpState;
            if (leveledUp) {
              updatedState = updateChallengeProgress(updatedState, 0, 0, 0, 1);
              playLevelUp();
              setTimeout(() => setShowLevelUp(true), 100);
              setTimeout(() => setShowLevelUp(false), 2000);
            }
          }

          if (newCombo > 0 && newCombo % 5 === 0) {
            playCombo(Math.floor(newCombo / 5));
          }

          playSpinWin();
          setSpinResult(segment);

          if (wheelRef.current) {
            const rect = wheelRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const particleCount = segment.type === 'jackpot' ? 30 : 12;
            spawnParticles(cx, cy, particleCount);
            addFloatingText(resultText, cx, cy - 60, resultColor);
          }

          if (platform === 'telegram' && window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
          }
          getFcSdk().then(s => s?.haptics.impactOccurred('heavy')).catch(() => {});

          setTimeout(() => setSpinResult(null), 2500);
          setSpinning(false);

          return updatedState;
        });
      }, SPIN_DURATION + 100);

      return newState;
    });
  }, [spinning, platform, spawnParticles, addFloatingText]);

  const handleClaimDaily = useCallback(() => {
    setState((prev) => {
      const { state: newState, reward } = claimDailyReward(prev);
      if (reward > 0) {
        playReward();
        setShowReward({ show: true, amount: reward });
        setTimeout(() => setShowReward({ show: false, amount: 0 }), 3000);
      }
      return newState;
    });
  }, []);

  const handleApplyReferral = useCallback(() => {
    if (!referralInput.trim()) return;
    setState((prev) => {
      const { state: newState, success, message } = applyReferralCode(prev, referralInput.trim());
      setReferralMsg(message);
      if (success) {
        playReward();
        setShowReward({ show: true, amount: 500 });
        setTimeout(() => setShowReward({ show: false, amount: 0 }), 3000);
      }
      return newState;
    });
    setReferralInput('');
  }, [referralInput]);

  const handlePurchase = useCallback((item: ShopItem) => {
    setState((prev) => {
      const { state: newState, success, message } = purchaseItem(prev, item);
      setShopMsg(message);
      if (success) playReward();
      setTimeout(() => setShopMsg(''), 3000);
      return newState;
    });
  }, []);

  const handleClaimChallenge = useCallback((challengeId: string) => {
    setState((prev) => {
      const { state: newState, reward } = claimChallengeReward(prev, challengeId);
      if (reward > 0) {
        playReward();
        setShowReward({ show: true, amount: reward });
        setTimeout(() => setShowReward({ show: false, amount: 0 }), 3000);
      }
      return newState;
    });
  }, []);

  const shareScore = useCallback(async () => {
    const text = `I spun ${state.totalSpins} times and reached level ${state.level} (${getLevelTitle(state.level)}) on BonkWithClaude! Score: ${state.score}. Can you beat me?`;
    try {
      const s = await getFcSdk();
      if (s) {
        await s.actions.composeCast({
          text,
          embeds: [typeof window !== 'undefined' ? window.location.origin : ''],
        });
      } else if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: 'BonkWithClaude', text, url: window.location.origin });
      }
    } catch {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: 'BonkWithClaude', text, url: window.location.origin });
      }
    }
  }, [state.score, state.totalSpins, state.level]);

  const playerName = useMemo(() => {
    if (platform === 'telegram') {
      const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (user) return user.first_name || 'Player';
    }
    return 'Player';
  }, [platform]);

  useEffect(() => {
    if (!initialized || state.totalSpins === 0) return;
    saveLeaderboardEntry({ name: playerName, score: state.score, level: state.level });
  }, [state.score, state.level, initialized, playerName]);

  const comboMultiplier = getMultiplier(state.combo);
  const xpPercent = state.xpToNext > 0 ? (state.xp / state.xpToNext) * 100 : 0;
  const energyPercent = (state.energy / state.maxEnergy) * 100;
  const energyRefillSec = state.energy < state.maxEnergy ? Math.ceil((1000 - (Date.now() - state.lastEnergyRefill % 1000)) / 1000) : 0;

  const cx = WHEEL_SIZE / 2;
  const cy = WHEEL_SIZE / 2;
  const radius = cx - 4;
  const segAngle = (2 * Math.PI) / WHEEL_SEGMENTS.length;

  const segmentPaths = useMemo(() => WHEEL_SEGMENTS.map((seg, i) => {
    const startAngle = i * segAngle - Math.PI / 2;
    const endAngle = startAngle + segAngle;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = segAngle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const midAngle = startAngle + segAngle / 2;
    const labelR = radius * 0.65;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    return { path, lx, ly, seg };
  }), [cx, cy, radius, segAngle]);

  if (!initialized) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <div className="w-12 h-12 border-4 border-[var(--accent-green)] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto relative overflow-hidden pb-16">
      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center animate-level-up">
            <p className="text-5xl font-black text-[var(--accent-yellow)] drop-shadow-lg" style={{ fontFamily: 'var(--font-display)' }}>LEVEL UP!</p>
            <p className="text-2xl font-bold text-white mt-2">Level {state.level}</p>
            <p className="text-lg text-white/70">{getLevelTitle(state.level)}</p>
          </div>
        </div>
      )}

      {showReward.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center animate-reward-pop">
            <p className="text-4xl font-black text-[var(--accent-green)]">+{showReward.amount}</p>
            <p className="text-lg text-white/80">Daily Reward!</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {tab === 'game' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
            <div className="text-center">
              <p className="text-6xl font-black text-[var(--accent-green)] tabular-nums drop-shadow-lg" style={{ fontFamily: 'var(--font-display)' }}>
                {state.score.toLocaleString()}
              </p>
              {state.combo > 0 && (
                <p className={`text-lg font-bold mt-1 ${state.combo >= 20 ? 'text-red-400 animate-pulse' : state.combo >= 10 ? 'text-orange-400' : 'text-white/70'}`}>
                  {state.combo}x COMBO {comboMultiplier > 1 && `(${comboMultiplier}x multiplier)`}
                </p>
              )}
            </div>

            {state.combo > 0 && (
              <div className="w-full max-w-xs">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${Math.min(100, (state.combo / 50) * 100)}%`,
                      background: state.combo >= 30 ? 'linear-gradient(90deg, #FF1744, #FF4081)' : state.combo >= 10 ? 'linear-gradient(90deg, #FF6B35, #00E676)' : '#00E676',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Level Progress Bar */}
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span className="font-bold text-[var(--accent-green)]">Lvl {state.level} — {getLevelTitle(state.level)}</span>
                <span>{state.xp}/{state.xpToNext} XP</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${xpPercent}%`,
                    background: 'linear-gradient(90deg, #8B5CF6, #D946EF, #F43F5E)',
                  }}
                />
              </div>
            </div>

            {/* Spin Wheel */}
            <div className="relative my-4" ref={wheelRef}>
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(from 0deg, ${state.combo >= 20 ? '#FF4081' : state.combo >= 10 ? '#00E676' : '#00B0FF'}, transparent, ${state.combo >= 20 ? '#FF4081' : state.combo >= 10 ? '#00E676' : '#00B0FF'})`,
                filter: 'blur(20px)',
                opacity: spinning ? 0.6 : 0.3,
                transform: 'scale(1.15)',
              }} />

              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <svg width="28" height="32" viewBox="0 0 28 32">
                  <polygon points="14,32 0,0 28,0" fill="#00E676" stroke="#00C853" strokeWidth="1" />
                  <polygon points="14,26 4,4 24,4" fill="#69F0AE" opacity="0.5" />
                </svg>
              </div>

              {/* Outer ring */}
              <div
                className="relative rounded-full border-4 border-[var(--accent-green)]"
                style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
              >
                {/* Rotating wheel */}
                <div
                  className="w-full h-full rounded-full overflow-hidden"
                  style={{
                    transform: `rotate(${spinAngle}deg)`,
                    transition: spinning ? `transform ${SPIN_DURATION}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
                  }}
                >
                  <svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
                    {segmentPaths.map(({ path, lx, ly, seg }, i) => (
                      <g key={i}>
                        <path d={path} fill={seg.color} stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
                        <text
                          x={lx}
                          y={ly - 8}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="20"
                          fill={seg.textColor}
                        >
                          {seg.emoji}
                        </text>
                        <text
                          x={lx}
                          y={ly + 14}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="11"
                          fontWeight="800"
                          fill={seg.textColor}
                        >
                          {seg.label}
                        </text>
                      </g>
                    ))}
                    {/* Center hub */}
                    <circle cx={cx} cy={cy} r="24" fill="#1a1a2e" stroke="var(--accent-green)" strokeWidth="3" />
                    <circle cx={cx} cy={cy} r="16" fill="url(#hubGrad)" />
                    <defs>
                      <radialGradient id="hubGrad">
                        <stop offset="0%" stopColor="#00E676" />
                        <stop offset="100%" stopColor="#00C853" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Spin button - below wheel like Boinkers */}
              <button
                onClick={spin}
                disabled={spinning || state.energy <= 0}
                className={`mt-6 w-24 h-24 rounded-full text-xl font-black transition-all select-none mx-auto block ${
                  spinning
                    ? 'bg-gray-600 text-gray-400 cursor-wait'
                    : state.energy > 0
                      ? 'bg-gradient-to-br from-[var(--accent-green)] to-emerald-600 text-[var(--bg-primary)] shadow-lg shadow-green-500/40 active:scale-90 hover:scale-105 cursor-pointer animate-pulse-glow'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent', fontFamily: 'var(--font-display)' }}
              >
                {spinning ? '...' : state.energy > 0 ? 'SPIN' : 'EMPTY'}
              </button>

              {particles.map((p) => (
                <div
                  key={p.id}
                  className="fixed rounded-full pointer-events-none"
                  style={{
                    left: p.x,
                    top: p.y,
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    opacity: p.life,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
              {floatingTexts.map((t) => (
                <div
                  key={t.id}
                  className="fixed pointer-events-none font-bold text-lg animate-float-up"
                  style={{ left: t.x, top: t.y, color: t.color, transform: 'translate(-50%, -50%)' }}
                >
                  {t.text}
                </div>
              ))}
            </div>

            {spinResult && (
              <div className="animate-spin-result-pop text-center">
                <p className="text-2xl font-black" style={{ color: spinResult.color }}>
                  {spinResult.emoji}{' '}
                  {spinResult.type === 'coins' && `+${spinResult.value} Coins`}
                  {spinResult.type === 'xp' && `+${spinResult.value} XP`}
                  {spinResult.type === 'multiplier' && `${spinResult.value}x Boost!`}
                  {spinResult.type === 'jackpot' && `JACKPOT! +${spinResult.value}!`}
                  {spinResult.type === 'bonus' && `BONUS! +3 Spins!`}
                  {spinResult.type === 'nothing' && `Nothing! Try again!`}
                </p>
              </div>
            )}

            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Energy</span>
                <span>{state.energy}/{state.maxEnergy}{state.energy < state.maxEnergy && ` (${energyRefillSec}s)`}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${energyPercent}%`,
                    background: energyPercent > 50 ? '#00E676' : energyPercent > 20 ? '#FFD700' : '#FF1744',
                  }}
                />
              </div>
            </div>

            <button
              onClick={shareScore}
              className="mt-2 px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              Share Score
            </button>
          </div>
        )}

        {tab === 'stats' && (
          <div className="flex-1 p-4 space-y-3">
            <h2 className="text-xl font-bold text-[var(--accent-green)] mb-4">Your Stats</h2>
            <StatRow label="Total Score" value={state.score.toLocaleString()} />
            <StatRow label="Total Spins" value={state.totalSpins.toLocaleString()} />
            <StatRow label="Best Combo" value={`${state.bestCombo}x`} />
            <StatRow label="Level" value={`${state.level} — ${getLevelTitle(state.level)}`} />
            <StatRow label="XP Progress" value={`${state.xp}/${state.xpToNext}`} />
            <StatRow label="Daily Streak" value={`Day ${state.dailyRewardDay}`} />
            <StatRow label="Sessions Played" value={String(state.sessionsPlayed)} />
            <StatRow label="Multiplier" value={`${comboMultiplier}x at max combo`} />
            <div className="pt-4">
              <button
                onClick={() => {
                  if (confirm('Reset all progress? This cannot be undone.')) {
                    const fresh = getDefaultState();
                    saveState(fresh);
                    setState(fresh);
                  }
                }}
                className="text-sm text-red-400/60 hover:text-red-400 transition-colors"
              >
                Reset Progress
              </button>
            </div>
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="flex-1 p-4">
            <h2 className="text-xl font-bold text-[var(--accent-green)] mb-4">Leaderboard</h2>
            {leaderboard.length === 0 ? (
              <p className="text-white/40 text-center mt-8">No scores yet. Start spinning!</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div
                    key={`${entry.name}-${i}`}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      i < 3 ? 'bg-white/10' : 'bg-white/5'
                    }`}
                  >
                    <span className={`text-lg font-bold w-8 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-white/40'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{entry.name}</p>
                      <p className="text-xs text-white/50">Level {entry.level}</p>
                    </div>
                    <p className="font-bold text-[var(--accent-green)]">{entry.score.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'inbox' && (
          <div className="flex-1 p-4">
            <h2 className="text-xl font-bold text-[var(--accent-green)] mb-4">Inbox</h2>
            <div className="space-y-3">
              {!state.dailyRewardClaimed && state.dailyRewardDay > 0 ? (
                <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🎁</span>
                    <div className="flex-1">
                      <p className="font-bold text-white">Daily Reward — Day {state.dailyRewardDay}</p>
                      <p className="text-sm text-white/60">{state.dailyRewardDay * 50 + 50} coins + full energy refill</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClaimDaily}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-bold text-sm hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Claim Reward
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <span className="text-3xl mb-2 block">📭</span>
                  <p className="text-white/40 text-sm">No new rewards</p>
                  <p className="text-white/30 text-xs mt-1">Come back tomorrow for your daily streak bonus!</p>
                </div>
              )}

              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Level {state.level} — {getLevelTitle(state.level)}</p>
                    <p className="text-sm text-white/50">{state.xp}/{state.xpToNext} XP to next level</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Daily Streak: Day {state.dailyRewardDay}</p>
                    <p className="text-sm text-white/50">Keep spinning to maintain your streak!</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Energy: {state.energy}/{state.maxEnergy}</p>
                    <p className="text-sm text-white/50">1 energy regenerated per second</p>
                  </div>
                </div>
              </div>

              {state.activeBoost.multiplier > 1 && state.activeBoost.spinsLeft > 0 && (
                <div className="p-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔥</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{state.activeBoost.multiplier}x Boost Active</p>
                      <p className="text-sm text-white/50">{state.activeBoost.spinsLeft} spins remaining</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'shop' && (
          <div className="flex-1 p-4">
            <h2 className="text-xl font-bold text-[var(--accent-green)] mb-2">Shop</h2>
            <p className="text-sm text-white/50 mb-4">Balance: <span className="text-[var(--accent-yellow)] font-bold">{state.score.toLocaleString()}</span> coins</p>
            {shopMsg && (
              <div className={`mb-3 p-3 rounded-lg text-sm font-medium text-center ${shopMsg.includes('!') && !shopMsg.includes('Not') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {shopMsg}
              </div>
            )}
            <div className="space-y-3">
              {SHOP_ITEMS.map((item) => {
                const owned = item.type === 'cosmetic' && state.ownedCosmetics.includes(item.value);
                const canAfford = state.score >= item.price;
                return (
                  <div key={item.id} className={`p-4 rounded-xl border ${owned ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.emoji}</span>
                      <div className="flex-1">
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-xs text-white/50">{item.description}</p>
                      </div>
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={owned || !canAfford}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          owned
                            ? 'bg-green-500/20 text-green-400 cursor-default'
                            : canAfford
                              ? 'bg-gradient-to-r from-[var(--accent-yellow)] to-amber-500 text-black hover:scale-105 active:scale-95'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {owned ? 'Owned' : item.price.toLocaleString()}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'referral' && (
          <div className="flex-1 p-4">
            <h2 className="text-xl font-bold text-[var(--accent-green)] mb-4">Invite Friends</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl">
                <p className="text-sm text-white/60 mb-2">Your Referral Code</p>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-black text-[var(--accent-yellow)] tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                    {state.referral.code}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(state.referral.code);
                    }}
                    className="px-3 py-1.5 bg-white/10 rounded-lg text-xs text-white/70 hover:bg-white/20 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-white/40 mt-2">Share this code with friends. You both get bonus coins!</p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/60 mb-3">Have a referral code?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralInput}
                    onChange={(e) => { setReferralInput(e.target.value.toUpperCase()); setReferralMsg(''); }}
                    placeholder="Enter code"
                    maxLength={8}
                    className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--accent-green)] transition-colors text-center tracking-widest text-lg font-bold"
                  />
                  <button
                    onClick={handleApplyReferral}
                    className="px-4 py-2.5 bg-gradient-to-r from-[var(--accent-green)] to-emerald-600 text-black rounded-lg font-bold text-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    Apply
                  </button>
                </div>
                {referralMsg && (
                  <p className={`mt-2 text-sm ${referralMsg.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {referralMsg}
                  </p>
                )}
              </div>

              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="font-bold text-white">Referral Stats</p>
                    <p className="text-sm text-white/50">Friends invited: {state.referral.referralCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="font-bold text-white">Bonus Earned</p>
                    <p className="text-sm text-[var(--accent-yellow)]">{state.referral.referralBonus.toLocaleString()} coins</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/60 mb-2">How it works</p>
                <ul className="space-y-1.5 text-xs text-white/50">
                  <li>• Share your code with friends</li>
                  <li>• They enter it and get 500 coins</li>
                  <li>• You get 250 coins per referral</li>
                  <li>• No limit on referrals!</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  const text = `Play BonkWithClaude and use my referral code ${state.referral.code} for 500 bonus coins!`;
                  if (navigator.share) {
                    navigator.share({ title: 'BonkWithClaude', text, url: window.location.origin });
                  } else {
                    navigator.clipboard?.writeText(text + ' ' + window.location.origin);
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-[var(--accent-pink)] to-purple-600 rounded-xl text-white font-bold hover:scale-[1.02] active:scale-95 transition-all"
              >
                Share with Friends
              </button>
            </div>
          </div>
        )}

        {tab === 'challenges' && (
          <div className="flex-1 p-4">
            <h2 className="text-xl font-bold text-[var(--accent-green)] mb-2">Daily Challenges</h2>
            <p className="text-sm text-white/50 mb-4">Complete challenges for bonus coins!</p>
            <div className="space-y-3">
              {state.dailyChallenges.length === 0 ? (
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-white/40">No active challenges. Spin to start!</p>
                </div>
              ) : (
                state.dailyChallenges.map((c) => {
                  const progressPercent = Math.min(100, (c.progress / c.goal) * 100);
                  const claimed = c.progress > c.goal;
                  return (
                    <div key={c.id} className={`p-4 rounded-xl border ${c.completed ? 'bg-green-500/10 border-green-500/30' : claimed ? 'bg-white/5 border-white/5 opacity-50' : 'bg-white/5 border-white/10'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{c.emoji}</span>
                        <div className="flex-1">
                          <p className="font-bold text-white">{c.name}</p>
                          <p className="text-xs text-white/50">{c.description}</p>
                        </div>
                        <span className="text-sm font-bold text-[var(--accent-yellow)]">+{c.reward}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progressPercent}%`,
                            background: c.completed ? 'linear-gradient(90deg, #00E676, #00C853)' : 'linear-gradient(90deg, #8B5CF6, #D946EF)',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">{Math.min(c.progress, c.goal)}/{c.goal}</span>
                        {c.completed && !claimed && (
                          <button
                            onClick={() => handleClaimChallenge(c.id)}
                            className="px-4 py-1.5 bg-gradient-to-r from-[var(--accent-green)] to-emerald-600 text-black rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                          >
                            Claim
                          </button>
                        )}
                        {claimed && (
                          <span className="text-xs text-green-400">Claimed ✓</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar - like Boinkers */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-white/10 z-40">
        <div className="max-w-md mx-auto flex">
          {([
            { id: 'game' as Tab, label: 'Play', emoji: '🎰' },
            { id: 'challenges' as Tab, label: 'Tasks', emoji: '📋' },
            { id: 'shop' as Tab, label: 'Shop', emoji: '🛒' },
            { id: 'leaderboard' as Tab, label: 'Ranks', emoji: '🏆' },
            { id: 'referral' as Tab, label: 'Invite', emoji: '👥' },
            { id: 'inbox' as Tab, label: 'Inbox', emoji: '📬', hasBadge: !state.dailyRewardClaimed && state.dailyRewardDay > 0 },
            { id: 'stats' as Tab, label: 'Profile', emoji: '👤' },
          ]).map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative flex-1 flex flex-col items-center py-2 gap-0.5 transition-all ${
                tab === item.id ? 'text-[var(--accent-green)]' : 'text-white/50 hover:text-white/70'
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
              {item.hasBadge && (
                <span className="absolute top-1 right-1/4 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg">
      <span className="text-white/60 text-sm">{label}</span>
      <span className="text-white font-semibold text-sm">{value}</span>
    </div>
  );
}
