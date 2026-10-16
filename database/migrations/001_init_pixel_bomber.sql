-- Migration: 001_init_pixel_bomber.sql
-- Hệ thống lưu trữ hồ sơ người chơi, Trang phục Hiệp Sĩ (Skins), Chế độ 2P & Bảng xếp hạng

CREATE TABLE IF NOT EXISTS player_profiles (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(50) NOT NULL DEFAULT 'HERO_01',
    selected_skin VARCHAR(30) NOT NULL DEFAULT 'KNIGHT_RED',
    highest_level VARCHAR(10) NOT NULL DEFAULT '1-3',
    total_score INTEGER NOT NULL DEFAULT 0,
    bombs_stat INTEGER NOT NULL DEFAULT 3,
    fire_stat INTEGER NOT NULL DEFAULT 2,
    speed_stat INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaderboard_scores (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(50) NOT NULL,
    level_code VARCHAR(10) NOT NULL,
    game_mode VARCHAR(10) NOT NULL DEFAULT '1P',
    skin_used VARCHAR(30) NOT NULL DEFAULT 'KNIGHT_RED',
    score INTEGER NOT NULL DEFAULT 0,
    time_remaining_sec INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc ON leaderboard_scores (score DESC);
