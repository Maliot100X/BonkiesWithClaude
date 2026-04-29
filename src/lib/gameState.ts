const STORAGE_KEY = 'bonk_game_state';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  type: 'energy' | 'boost' | 'cosmetic';
  value: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'energy_small', name: 'Energy Drink', description: '+5 energy instantly', price: 200, emoji: '⚡', type: 'energy', value: 5 },
  { id: 'energy_large', name: 'Energy Pack', description: '+15 energy instantly', price: 500, emoji: '🔋', type: 'energy', value: 15 },
  { id: 'energy_max', name: 'Full Refill', description: 'Refill all energy', price: 1000, emoji: '💯', type: 'energy', value: 999 },
  { id: 'boost_2x', name: '2x Boost', description: '2x coins for next 10 spins', price: 800, emoji: '🔥', type: 'boost', value: 2 },
  { id: 'boost_5x', name: '5x Boost', description: '5x coins for next 5 spins', price: 2000, emoji: '💎', type: 'boost', value: 5 },
  { id: 'cosmetic_crown', name: 'Golden Crown', description: 'Show off your crown on leaderboard', price: 5000, emoji: '👑', type: 'cosmetic', value: 1 },
  { id: 'cosmetic_frame', name: 'Neon Frame', description: 'Glowing neon profile frame', price: 3000, emoji: '🖼️', type: 'cosmetic', value: 2 },
  { id: 'max_energy_up', name: 'Energy Upgrade', description: '+5 max energy permanently', price: 2500, emoji: '📈', type: 'energy', value: 0 },
];

export interface ReferralData {
  code: string;
  referredBy: string | null;
  referralCount: number;
  referralBonus: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  goal: number;
  reward: number;
  emoji: string;
  progress: number;
  completed: boolean;
}

export const DAILY_CHALLENGES: Omit<Challenge, 'progress' | 'completed'>[] = [
  { id: 'spin_50', name: 'Spin Master', description: 'Spin 50 times today', goal: 50, reward: 500, emoji: '🎰' },
  { id: 'combo_10', name: 'Combo King', description: 'Reach a 10x combo', goal: 10, reward: 300, emoji: '🔥' },
  { id: 'earn_5000', name: 'Coin Rain', description: 'Earn 5,000 coins today', goal: 5000, reward: 400, emoji: '🪙' },
  { id: 'level_up', name: 'Level Up!', description: 'Gain 1 level today', goal: 1, reward: 250, emoji: '⬆️' },
];

export interface GameState {
  score: number;
  totalSpins: number;
  combo: number;
  maxCombo: number;
  bestCombo: number;
  energy: number;
  maxEnergy: number;
  lastEnergyRefill: number;
  level: number;
  xp: number;
  xpToNext: number;
  dailyRewardDay: number;
  dailyRewardClaimed: boolean;
  lastDailyReset: number;
  totalScore: number;
  sessionsPlayed: number;
  referral: ReferralData;
  activeBoost: { multiplier: number; spinsLeft: number };
  ownedCosmetics: number[];
  dailyChallenges: Challenge[];
  dailySpins: number;
  dailyCoinsEarned: number;
  dailyMaxCombo: number;
  dailyLevelsGained: number;
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getDefaultState(): GameState {
  return {
    score: 0,
    totalSpins: 0,
    combo: 0,
    maxCombo: 0,
    bestCombo: 0,
    energy: 20,
    maxEnergy: 20,
    lastEnergyRefill: Date.now(),
    level: 1,
    xp: 0,
    xpToNext: 100,
    dailyRewardDay: 0,
    dailyRewardClaimed: false,
    lastDailyReset: 0,
    totalScore: 0,
    sessionsPlayed: 1,
    referral: {
      code: generateReferralCode(),
      referredBy: null,
      referralCount: 0,
      referralBonus: 0,
    },
    activeBoost: { multiplier: 1, spinsLeft: 0 },
    ownedCosmetics: [],
    dailyChallenges: [],
    dailySpins: 0,
    dailyCoinsEarned: 0,
    dailyMaxCombo: 0,
    dailyLevelsGained: 0,
  };
}

export function loadState(): GameState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, unknown>;
      // Migrate legacy totalBonks -> totalSpins
      if ('totalBonks' in parsed && !('totalSpins' in parsed)) {
        parsed.totalSpins = parsed.totalBonks;
        delete parsed.totalBonks;
      }
      return { ...getDefaultState(), ...parsed as Partial<GameState> };
    }
  } catch {
    // corrupt storage
  }
  return getDefaultState();
}

export function saveState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Also save to Telegram CloudStorage if available
    const storage = window.Telegram?.WebApp?.CloudStorage;
    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // storage full or unavailable
  }
}

export function loadFromTelegram(): Promise<GameState | null> {
  return new Promise((resolve) => {
    const storage = window.Telegram?.WebApp?.CloudStorage;
    if (!storage) {
      resolve(null);
      return;
    }
    storage.getItem(STORAGE_KEY, (err, value) => {
      if (!err && value) {
        try {
          const parsed = JSON.parse(value) as Record<string, unknown>;
          // Migrate legacy totalBonks -> totalSpins
          if ('totalBonks' in parsed && !('totalSpins' in parsed)) {
            parsed.totalSpins = parsed.totalBonks;
            delete parsed.totalBonks;
          }
          resolve({ ...getDefaultState(), ...parsed as Partial<GameState> });
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
}

export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function addXp(state: GameState, amount: number): { state: GameState; leveledUp: boolean } {
  let { xp, level, xpToNext } = state;
  xp += amount;
  let leveledUp = false;
  while (xp >= xpToNext) {
    xp -= xpToNext;
    level++;
    xpToNext = getXpForLevel(level);
    leveledUp = true;
  }
  return {
    state: { ...state, xp, level, xpToNext },
    leveledUp,
  };
}

export function getMultiplier(combo: number): number {
  if (combo >= 50) return 5;
  if (combo >= 30) return 4;
  if (combo >= 20) return 3;
  if (combo >= 10) return 2;
  if (combo >= 5) return 1.5;
  return 1;
}

export function refillEnergy(state: GameState): GameState {
  const now = Date.now();
  const elapsed = now - state.lastEnergyRefill;
  const refillRate = 1000; // 1 energy per second
  const energyToAdd = Math.floor(elapsed / refillRate);
  if (energyToAdd <= 0) return state;
  const newEnergy = Math.min(state.maxEnergy, state.energy + energyToAdd);
  return {
    ...state,
    energy: newEnergy,
    lastEnergyRefill: now - (elapsed % refillRate),
  };
}

export function checkDailyReward(state: GameState): GameState {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const lastReset = state.lastDailyReset;

  if (today > lastReset) {
    const yesterday = today - 86400000;
    const isConsecutive = lastReset === yesterday;
    const newDay = isConsecutive ? state.dailyRewardDay + 1 : 1;
    return {
      ...state,
      dailyRewardDay: newDay,
      dailyRewardClaimed: false,
      lastDailyReset: today,
    };
  }
  return state;
}

export function claimDailyReward(state: GameState): { state: GameState; reward: number } {
  if (state.dailyRewardClaimed) return { state, reward: 0 };
  const reward = state.dailyRewardDay * 50 + 50;
  const newState = {
    ...state,
    score: state.score + reward,
    totalScore: state.totalScore + reward,
    dailyRewardClaimed: true,
    energy: state.maxEnergy,
  };
  return { state: newState, reward };
}

export function getLevelTitle(level: number): string {
  if (level >= 50) return 'Spin Legend';
  if (level >= 40) return 'Spin Master';
  if (level >= 30) return 'Spin Expert';
  if (level >= 20) return 'Spin Pro';
  if (level >= 15) return 'Spin Veteran';
  if (level >= 10) return 'Spin Warrior';
  if (level >= 7) return 'Spin Ace';
  if (level >= 5) return 'Spin Apprentice';
  if (level >= 3) return 'Spin Initiate';
  return 'Spin Rookie';
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  level: number;
}

export function saveLeaderboardEntry(entry: LeaderboardEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem('bonk_leaderboard');
    const board: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];
    const existing = board.findIndex((e) => e.name === entry.name);
    if (existing >= 0) {
      if (entry.score > board[existing].score) {
        board[existing] = entry;
      }
    } else {
      board.push(entry);
    }
    board.sort((a, b) => b.score - a.score);
    localStorage.setItem('bonk_leaderboard', JSON.stringify(board.slice(0, 100)));
  } catch {
    // ignore
  }
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('bonk_leaderboard');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function applyReferralCode(state: GameState, code: string): { state: GameState; success: boolean; message: string } {
  if (state.referral.referredBy) {
    return { state, success: false, message: 'You already used a referral code' };
  }
  if (code.toUpperCase() === state.referral.code) {
    return { state, success: false, message: "You can't use your own code" };
  }
  const bonus = 500;
  const newState: GameState = {
    ...state,
    score: state.score + bonus,
    totalScore: state.totalScore + bonus,
    referral: { ...state.referral, referredBy: code.toUpperCase() },
  };
  saveReferralUsage(code.toUpperCase());
  return { state: newState, success: true, message: `+${bonus} coins for using a referral code!` };
}

export function useReferralBonus(state: GameState): { state: GameState; bonus: number } {
  const stored = localStorage.getItem('bonk_referral_uses');
  const uses: { code: string; at: number }[] = stored ? JSON.parse(stored) : [];
  const myUses = uses.filter((u) => u.code === state.referral.code);
  const newCount = myUses.length;
  if (newCount <= state.referral.referralCount) return { state, bonus: 0 };
  const bonusPerRef = 250;
  const bonus = (newCount - state.referral.referralCount) * bonusPerRef;
  return {
    state: {
      ...state,
      score: state.score + bonus,
      totalScore: state.totalScore + bonus,
      referral: { ...state.referral, referralCount: newCount, referralBonus: state.referral.referralBonus + bonus },
    },
    bonus,
  };
}

function saveReferralUsage(code: string): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem('bonk_referral_uses');
    const uses: { code: string; at: number }[] = stored ? JSON.parse(stored) : [];
    uses.push({ code, at: Date.now() });
    localStorage.setItem('bonk_referral_uses', JSON.stringify(uses));
  } catch {
    // ignore
  }
}

export function purchaseItem(state: GameState, item: ShopItem): { state: GameState; success: boolean; message: string } {
  if (state.score < item.price) {
    return { state, success: false, message: 'Not enough coins!' };
  }
  if (item.type === 'cosmetic' && state.ownedCosmetics.includes(item.value)) {
    return { state, success: false, message: 'You already own this!' };
  }

  let newState: GameState = {
    ...state,
    score: state.score - item.price,
  };

  if (item.type === 'energy') {
    if (item.id === 'max_energy_up') {
      newState = { ...newState, maxEnergy: newState.maxEnergy + 5, energy: newState.energy + 5 };
    } else {
      const add = Math.min(item.value, newState.maxEnergy - newState.energy);
      newState = { ...newState, energy: newState.energy + add };
    }
  } else if (item.type === 'boost') {
    newState = { ...newState, activeBoost: { multiplier: item.value, spinsLeft: item.value === 5 ? 5 : 10 } };
  } else if (item.type === 'cosmetic') {
    newState = { ...newState, ownedCosmetics: [...newState.ownedCosmetics, item.value] };
  }

  return { state: newState, success: true, message: `Purchased ${item.name}!` };
}

export function initDailyChallenges(state: GameState): GameState {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (state.lastDailyReset === today && state.dailyChallenges.length > 0) return state;
  const challenges: Challenge[] = DAILY_CHALLENGES.map((c) => ({ ...c, progress: 0, completed: false }));
  return { ...state, dailyChallenges: challenges, dailySpins: 0, dailyCoinsEarned: 0, dailyMaxCombo: 0, dailyLevelsGained: 0 };
}

export function updateChallengeProgress(state: GameState, spinsDelta: number, coinsDelta: number, comboValue: number, levelsDelta: number): GameState {
  const dailySpins = state.dailySpins + spinsDelta;
  const dailyCoinsEarned = state.dailyCoinsEarned + coinsDelta;
  const dailyMaxCombo = Math.max(state.dailyMaxCombo, comboValue);
  const dailyLevelsGained = state.dailyLevelsGained + levelsDelta;

  const challenges = state.dailyChallenges.map((c) => {
    let progress = c.progress;
    if (c.id === 'spin_50') progress = dailySpins;
    if (c.id === 'combo_10') progress = dailyMaxCombo;
    if (c.id === 'earn_5000') progress = dailyCoinsEarned;
    if (c.id === 'level_up') progress = dailyLevelsGained;
    return { ...c, progress: Math.min(progress, c.goal), completed: progress >= c.goal };
  });

  return { ...state, dailySpins, dailyCoinsEarned, dailyMaxCombo, dailyLevelsGained, dailyChallenges: challenges };
}

export function claimChallengeReward(state: GameState, challengeId: string): { state: GameState; reward: number } {
  const challenge = state.dailyChallenges.find((c) => c.id === challengeId);
  if (!challenge || !challenge.completed) return { state, reward: 0 };
  const newState: GameState = {
    ...state,
    score: state.score + challenge.reward,
    totalScore: state.totalScore + challenge.reward,
    dailyChallenges: state.dailyChallenges.map((c) =>
      c.id === challengeId ? { ...c, completed: false, progress: c.goal + 1 } : c
    ),
  };
  return { state: newState, reward: challenge.reward };
}
