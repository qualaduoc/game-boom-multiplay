import { FlameColorId, HeroSkinId, UserProfile } from '../types/gameTypes';

const STORAGE_KEY = 'pixel_bomber_user_v1';

export function getSavedUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveUserLocal(user: UserProfile | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  } catch {
    // Ignore storage errors
  }
}

export async function registerAccount(
  username: string,
  password: string,
  displayName: string
): Promise<{ ok: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, displayName }),
    });
    const json = await res.json();
    if (!json.success) {
      return { ok: false, error: json.error || 'Đăng ký thất bại' };
    }
    saveUserLocal(json.data);
    return { ok: true, user: json.data };
  } catch {
    return { ok: false, error: 'Không thể kết nối máy chủ' };
  }
}

export async function loginAccount(
  username: string,
  password: string
): Promise<{ ok: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();
    if (!json.success) {
      return { ok: false, error: json.error || 'Đăng nhập thất bại' };
    }
    saveUserLocal(json.data);
    return { ok: true, user: json.data };
  } catch {
    return { ok: false, error: 'Không thể kết nối máy chủ' };
  }
}

export async function quickPlayGuest(
  displayName: string
): Promise<{ ok: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });
    const json = await res.json();
    if (!json.success) {
      return { ok: false, error: json.error || 'Không thể tạo phiên Chơi Nhanh' };
    }
    saveUserLocal(json.data);
    return { ok: true, user: json.data };
  } catch {
    const fallbackGuest: UserProfile = {
      id: Date.now(),
      username: 'guest_local',
      displayName: (displayName || 'THAY_DUOC').toUpperCase().slice(0, 14),
      isGuest: true,
      coins: 500,
      eloRating: 1000,
      wins: 0,
      matchesPlayed: 0,
      equippedSkin: 'KNIGHT_RED',
      equippedFlame: 'CLASSIC_ORANGE',
      unlockedSkins: ['KNIGHT_RED'],
      unlockedFlames: ['CLASSIC_ORANGE'],
    };
    saveUserLocal(fallbackGuest);
    return { ok: true, user: fallbackGuest };
  }
}

export async function buyOrEquipItem(
  userId: number,
  category: 'SKIN' | 'FLAME',
  itemCode: HeroSkinId | FlameColorId
): Promise<{ ok: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/shop/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, category, itemCode }),
    });
    const json = await res.json();
    if (!json.success) {
      return { ok: false, error: json.error || 'Giao dịch thất bại' };
    }
    saveUserLocal(json.data);
    return { ok: true, user: json.data };
  } catch {
    return { ok: false, error: 'Không thể kết nối Cửa Hàng' };
  }
}

export async function rewardMatchCoins(
  userId: number,
  coinsEarned: number,
  isWin: boolean
): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/user/reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, coinsEarned, isWin }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      saveUserLocal(json.data);
      return json.data;
    }
    return null;
  } catch {
    return null;
  }
}

export interface PublicRoomSummary {
  roomCode: string;
  hostUsername: string;
  hostDisplayName: string;
  mode: string;
  levelCode: string;
  botCount: number;
  inProgress: boolean;
  playerCount: number;
  members: {
    slot: string;
    username?: string;
    displayName: string;
    skin: HeroSkinId;
    flameColor: FlameColorId;
  }[];
}

export async function fetchPublicRooms(): Promise<PublicRoomSummary[]> {
  try {
    const res = await fetch('/api/rooms');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data as PublicRoomSummary[];
    }
    return [];
  } catch {
    return [];
  }
}

