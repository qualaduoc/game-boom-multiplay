-- Migration 002: Multiplayer Users, Shop Unlocks & Public Active Rooms
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_guest INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 500,
  elo_rating INTEGER NOT NULL DEFAULT 1000,
  wins INTEGER NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  equipped_skin TEXT NOT NULL DEFAULT 'KNIGHT_RED',
  equipped_flame TEXT NOT NULL DEFAULT 'CLASSIC_ORANGE',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_unlocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_category TEXT NOT NULL, -- 'SKIN' | 'FLAME'
  item_code TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, item_category, item_code)
);

CREATE TABLE IF NOT EXISTS active_rooms (
  room_code TEXT PRIMARY KEY,
  host_username TEXT NOT NULL,
  host_display_name TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'BATTLE_ROYALE',
  level_code TEXT NOT NULL DEFAULT '1-1',
  bot_count INTEGER NOT NULL DEFAULT 0,
  player_count INTEGER NOT NULL DEFAULT 1,
  in_progress INTEGER NOT NULL DEFAULT 0,
  members_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
