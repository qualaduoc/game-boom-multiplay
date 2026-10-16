import { LeaderboardEntry } from '../types/gameTypes';

const LOCAL_STORAGE_KEY = 'pixel_bomber_leaderboard_v1';

const DEFAULT_SCORES: LeaderboardEntry[] = [
  { id: 1, player_name: 'THAY_DUOC_PRO', level_code: '1-3', score: 5400, time_remaining_sec: 145 },
  { id: 2, player_name: 'BOMBER_KING', level_code: '1-3', score: 3250, time_remaining_sec: 110 },
  { id: 3, player_name: 'SLIME_SLAYER', level_code: '1-2', score: 2100, time_remaining_sec: 95 },
  { id: 4, player_name: 'PIXEL_HERO', level_code: '1-1', score: 1250, time_remaining_sec: 135 },
];

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch('/api/leaderboard');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // Fallback to localStorage seamlessly
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as LeaderboardEntry[];
    }
  } catch {
    // Ignore storage read error
  }
  return DEFAULT_SCORES;
}

export async function submitHighScore(entry: LeaderboardEntry): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // Fallback to localStorage
  }

  const current = await fetchLeaderboard();
  const updated = [...current, { ...entry, id: Date.now() }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage write error
  }
  return updated;
}
