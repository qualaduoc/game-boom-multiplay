import { LevelConfig, TileType } from '../types/gameTypes';

const E: TileType = 'EMPTY';
const S: TileType = 'STONE';
const B: TileType = 'BRICK';
const F: TileType = 'BUSH';
const C: TileType = 'CHEST';
const X: TileType = 'EXIT';

export const LEVELS: LevelConfig[] = [
  {
    code: '1-1',
    title: 'Màn 1-1: Bờ Suối Khởi Đầu (Map Rộng 17×11)',
    subtitle: 'Mức Dễ — Không gian rộng thoáng, tìm Giày Đá (14s), Găng Ném (14s) & diệt hết Slime.',
    difficulty: 'EASY',
    biome: 'FOREST',
    timeLimitSec: 160,
    initialBombs: 1,
    initialFire: 1,
    initialSpeed: 1,
    playerStart: { col: 0, row: 0 },
    player2Start: { col: 0, row: 10 },
    exitPos: { col: 15, row: 1 },
    grid: [
      //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
      [E, E, E, B, F, E, E, B, E, F, E, B, E, E, F, X, E], // row 0
      [E, S, E, S, B, S, E, S, E, S, E, S, B, S, E, E, E], // row 1
      [E, E, E, E, B, F, E, E, E, E, B, F, E, E, E, E, E], // row 2
      [B, S, E, S, E, S, B, S, E, S, E, S, B, S, E, S, E], // row 3
      [F, E, B, E, E, E, E, E, C, E, E, E, F, E, E, E, E], // row 4
      [E, S, E, S, B, S, E, S, E, S, E, S, B, S, E, S, E], // row 5
      [E, E, E, E, F, E, E, E, B, E, C, E, E, E, F, E, E], // row 6
      [E, S, E, S, E, S, B, S, E, S, E, S, B, S, E, S, E], // row 7
      [E, E, E, E, B, E, E, E, E, E, B, E, E, E, E, E, E], // row 8
      [E, S, E, S, E, S, F, S, E, S, E, S, F, S, E, S, E], // row 9
      [E, E, E, B, E, E, F, E, B, E, E, E, F, E, E, E, E], // row 10
    ],
    items: [
      { col: 3, row: 0, type: 'BOMB_UP', exposed: false },
      { col: 4, row: 1, type: 'FIRE_UP', exposed: false },
      { col: 2, row: 4, type: 'KICK_BOOT', exposed: false },
      { col: 6, row: 3, type: 'THROW_GLOVE', exposed: false },
      { col: 4, row: 2, type: 'SPEED_UP', exposed: false },
    ],
    enemies: [
      { col: 8, row: 2, type: 'SLIME', dir: 'LEFT' },
      { col: 7, row: 6, type: 'SLIME', dir: 'RIGHT' },
      { col: 13, row: 8, type: 'SKELETON', dir: 'UP' },
    ],
    teleporters: [{ id: 'tp-11', colA: 2, rowA: 8, colB: 14, rowB: 2, color: '#38bdf8' }],
  },
  {
    code: '1-2',
    title: 'Màn 1-2: Quảng Trường Rừng Đá (Map Rộng 17×11)',
    subtitle: 'Mức Dễ — Đại lộ thông thoáng, Rương Kỹ Năng 14s & Cổng Dịch Chuyển.',
    difficulty: 'EASY',
    biome: 'FOREST',
    timeLimitSec: 155,
    initialBombs: 1,
    initialFire: 1,
    initialSpeed: 1,
    playerStart: { col: 0, row: 0 },
    player2Start: { col: 0, row: 10 },
    exitPos: { col: 15, row: 1 },
    grid: [
      //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
      [E, E, E, B, F, E, B, E, F, E, B, F, E, E, E, X, E], // row 0
      [E, S, E, S, B, S, E, S, E, S, E, S, B, S, E, E, E], // row 1
      [E, E, E, B, F, E, E, E, E, E, F, B, E, E, E, E, E], // row 2
      [E, S, B, S, E, S, F, S, E, S, B, S, E, S, F, S, E], // row 3
      [B, F, E, E, C, B, E, E, E, E, E, F, E, B, E, E, E], // row 4
      [E, S, E, S, B, S, E, S, E, S, B, S, E, S, E, S, E], // row 5
      [E, E, E, E, F, E, B, E, E, E, C, E, E, E, E, E, E], // row 6
      [E, S, E, S, E, S, B, S, E, S, B, S, E, S, E, S, E], // row 7
      [E, E, E, F, B, E, E, E, E, E, E, F, B, E, E, E, E], // row 8
      [E, S, E, S, E, S, E, S, B, S, E, S, E, S, E, S, E], // row 9
      [E, E, E, F, E, E, B, E, E, F, B, E, E, F, E, E, E], // row 10
    ],
    items: [
      { col: 3, row: 2, type: 'BOMB_UP', exposed: false },
      { col: 4, row: 1, type: 'FIRE_UP', exposed: false },
      { col: 5, row: 4, type: 'KICK_BOOT', exposed: false },
      { col: 6, row: 6, type: 'THROW_GLOVE', exposed: false },
      { col: 11, row: 2, type: 'SPEED_UP', exposed: false },
    ],
    enemies: [
      { col: 8, row: 2, type: 'SLIME', dir: 'LEFT' },
      { col: 7, row: 4, type: 'SKELETON', dir: 'RIGHT' },
      { col: 13, row: 6, type: 'SLIME', dir: 'DOWN' },
      { col: 13, row: 8, type: 'SKELETON', dir: 'LEFT' },
    ],
    spikes: [{ col: 8, row: 6, offset: 0.5 }],
    teleporters: [{ id: 'tp-12', colA: 2, rowA: 4, colB: 14, rowB: 2, color: '#a855f7' }],
  },
  {
    code: '1-3',
    title: 'Màn 1-3: Thung Lũng Cổ Đại (Map Rộng 17×11)',
    subtitle: 'Bản đồ gốc mở rộng 17×11 — Phá gạch nhặt Găng Ném & Giày Đá hữu hạn 14s!',
    difficulty: 'EASY',
    biome: 'FOREST',
    timeLimitSec: 150,
    initialBombs: 2,
    initialFire: 1,
    initialSpeed: 1,
    playerStart: { col: 1, row: 3 },
    player2Start: { col: 1, row: 8 },
    exitPos: { col: 15, row: 1 },
    grid: [
      //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
      [E, E, E, S, B, F, S, E, S, F, E, S, F, E, E, X, E], // row 0
      [E, S, E, B, B, F, B, S, E, E, E, B, F, E, E, E, E], // row 1
      [F, E, E, E, E, E, S, E, E, B, S, E, E, E, E, E, E], // row 2
      [E, E, E, E, E, E, E, E, F, E, F, B, F, E, E, E, E], // row 3
      [S, B, F, E, E, E, S, B, E, B, S, E, E, E, C, E, E], // row 4
      [E, B, S, B, E, B, S, B, E, E, F, C, F, E, S, E, E], // row 5
      [E, E, F, E, E, E, F, E, E, S, B, B, E, B, E, E, E], // row 6
      [E, E, S, B, B, E, B, S, F, B, S, F, B, S, E, S, E], // row 7
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E], // row 8
      [E, S, E, S, B, S, E, S, E, S, B, S, E, S, E, S, E], // row 9
      [E, E, E, E, E, F, E, E, B, E, E, F, E, E, E, E, E], // row 10
    ],
    items: [
      { col: 3, row: 1, type: 'FIRE_UP', exposed: false },
      { col: 3, row: 5, type: 'KICK_BOOT', exposed: false },
      { col: 5, row: 5, type: 'THROW_GLOVE', exposed: false },
      { col: 4, row: 1, type: 'SPEED_UP', exposed: false },
      { col: 7, row: 4, type: 'BOMB_UP', exposed: false },
      { col: 11, row: 6, type: 'HEART', exposed: false },
    ],
    enemies: [
      { col: 10, row: 1, type: 'SLIME', dir: 'LEFT' },
      { col: 13, row: 2, type: 'SKELETON', dir: 'RIGHT' },
      { col: 15, row: 4, type: 'SLIME', dir: 'UP' },
      { col: 4, row: 8, type: 'SLIME', dir: 'RIGHT' },
      { col: 9, row: 8, type: 'SKELETON', dir: 'RIGHT' },
    ],
    spikes: [
      { col: 5, row: 3, offset: 0 },
      { col: 8, row: 6, offset: 2.0 },
    ],
    teleporters: [{ id: 'tp-1', colA: 2, rowA: 10, colB: 10, rowB: 1, color: '#38bdf8' }],
  },
  {
    code: '2-1',
    title: 'Màn 2-1: Đền Cổ Bóng Ma (Map Rộng 17×11)',
    subtitle: 'Mức Trung Bình — Bóng Ma xuyên tường, Quảng trường rộng & Cổng Dịch Chuyển!',
    difficulty: 'MEDIUM',
    biome: 'RUINS',
    timeLimitSec: 155,
    initialBombs: 1,
    initialFire: 2,
    initialSpeed: 1,
    playerStart: { col: 0, row: 0 },
    player2Start: { col: 0, row: 10 },
    exitPos: { col: 15, row: 1 },
    grid: [
      //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
      [E, E, E, B, F, B, C, B, E, F, B, E, B, F, E, X, E], // row 0
      [E, S, E, S, B, S, E, S, E, S, F, S, B, S, E, E, E], // row 1
      [E, E, E, F, E, E, B, E, E, E, F, E, B, E, E, E, E], // row 2
      [B, S, E, S, F, S, E, S, E, S, E, S, F, S, E, S, E], // row 3
      [F, E, B, E, C, E, E, E, E, E, C, E, B, E, E, E, E], // row 4
      [E, S, F, S, B, S, E, S, E, S, B, S, F, S, E, S, E], // row 5
      [E, E, E, B, F, E, E, E, E, E, F, E, E, B, E, E, E], // row 6
      [E, S, E, S, E, S, B, S, E, S, B, S, E, S, F, S, E], // row 7
      [E, E, E, E, B, E, E, E, E, E, E, B, E, E, E, E, E], // row 8
      [E, S, E, S, E, S, F, S, E, S, F, S, E, S, E, S, E], // row 9
      [E, E, E, B, F, E, E, F, E, E, E, F, B, E, E, E, E], // row 10
    ],
    items: [
      { col: 3, row: 2, type: 'BOMB_UP', exposed: false },
      { col: 2, row: 4, type: 'KICK_BOOT', exposed: false },
      { col: 6, row: 2, type: 'THROW_GLOVE', exposed: false },
      { col: 3, row: 6, type: 'SPEED_UP', exposed: false },
      { col: 12, row: 4, type: 'FIRE_UP', exposed: false },
    ],
    enemies: [
      { col: 8, row: 2, type: 'PHANTOM', dir: 'LEFT' },
      { col: 13, row: 4, type: 'PHANTOM', dir: 'UP' },
      { col: 7, row: 6, type: 'SKELETON', dir: 'RIGHT' },
      { col: 13, row: 8, type: 'SLIME', dir: 'RIGHT' },
      { col: 9, row: 10, type: 'SKELETON', dir: 'LEFT' },
    ],
    spikes: [
      { col: 6, row: 4, offset: 0 },
      { col: 8, row: 2, offset: 1.5 },
      { col: 8, row: 6, offset: 2.5 },
    ],
    teleporters: [{ id: 'tp-21', colA: 2, rowA: 2, colB: 13, rowB: 6, color: '#38bdf8' }],
  },
  {
    code: '2-2',
    title: 'Màn 2-2: Đại Lộ Đá Chuyền (Map Rộng 17×11)',
    subtitle: 'Mức Trung Bình — Mở Rương lấy Giày Đá / Găng Ném 14s trên đại lộ đôi!',
    difficulty: 'MEDIUM',
    biome: 'RUINS',
    timeLimitSec: 155,
    initialBombs: 2,
    initialFire: 2,
    initialSpeed: 1,
    playerStart: { col: 0, row: 0 },
    player2Start: { col: 0, row: 10 },
    exitPos: { col: 15, row: 1 },
    grid: [
      //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
      [E, E, E, B, E, F, E, E, C, E, B, F, E, B, E, X, E], // row 0
      [E, S, E, S, E, S, S, S, E, S, S, S, E, S, E, E, E], // row 1
      [E, E, E, B, E, E, E, B, E, E, E, B, E, E, E, E, E], // row 2
      [E, S, E, S, S, S, E, S, E, S, E, S, S, S, E, S, E], // row 3
      [E, E, E, E, B, E, C, E, E, E, C, E, B, E, E, E, E], // row 4
      [E, S, E, S, E, S, E, S, E, S, E, S, E, S, E, S, E], // row 5
      [E, E, E, E, B, E, C, E, E, E, C, E, B, E, E, E, E], // row 6
      [E, S, E, S, S, S, E, S, E, S, E, S, S, S, E, S, E], // row 7
      [E, E, E, B, E, E, E, B, E, E, E, B, E, E, E, E, E], // row 8
      [E, S, E, S, E, S, S, S, E, S, S, S, E, S, E, S, E], // row 9
      [E, E, E, B, E, F, E, E, C, E, B, F, E, B, E, E, E], // row 10
    ],
    items: [
      { col: 4, row: 4, type: 'KICK_BOOT', exposed: false },
      { col: 3, row: 2, type: 'THROW_GLOVE', exposed: false },
      { col: 3, row: 8, type: 'SPEED_UP', exposed: false },
      { col: 7, row: 2, type: 'FIRE_UP', exposed: false },
      { col: 11, row: 2, type: 'BOMB_UP', exposed: false },
    ],
    enemies: [
      { col: 9, row: 2, type: 'SKELETON', dir: 'LEFT' },
      { col: 9, row: 8, type: 'SKELETON', dir: 'LEFT' },
      { col: 14, row: 5, type: 'PHANTOM', dir: 'UP' },
      { col: 5, row: 2, type: 'SLIME', dir: 'RIGHT' },
      { col: 5, row: 8, type: 'SLIME', dir: 'RIGHT' },
    ],
    spikes: [
      { col: 5, row: 4, offset: 0 },
      { col: 5, row: 6, offset: 2.0 },
      { col: 11, row: 4, offset: 1.0 },
    ],
    teleporters: [
      { id: 'tp-22a', colA: 2, rowA: 2, colB: 14, rowB: 8, color: '#38bdf8' },
      { id: 'tp-22b', colA: 2, rowA: 8, colB: 14, rowB: 2, color: '#f59e0b' },
    ],
  },
  {
    code: '2-3',
    title: 'Màn 2-3: Pháo Đài Hoàng Gia (Map Rộng 17×11)',
    subtitle: 'Mức Trung Bình — Đấu trường trung tâm cực rộng với Rương Kỹ Năng Hoàng Gia.',
    difficulty: 'MEDIUM',
    biome: 'RUINS',
    timeLimitSec: 160,
    initialBombs: 2,
    initialFire: 2,
    initialSpeed: 1,
    playerStart: { col: 0, row: 0 },
    player2Start: { col: 0, row: 10 },
    exitPos: { col: 15, row: 1 },
    grid: [
      //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
      [E, E, E, F, B, C, B, E, E, B, C, B, F, B, E, X, E], // row 0
      [E, S, E, S, F, S, B, S, E, S, B, S, F, S, E, E, E], // row 1
      [E, E, E, B, E, E, E, E, E, E, E, E, B, E, E, E, E], // row 2
      [F, S, E, S, B, S, E, S, E, S, E, S, B, S, E, S, E], // row 3
      [B, E, F, B, C, E, E, E, C, E, E, E, C, B, F, E, E], // row 4
      [E, S, E, S, E, S, E, S, E, S, E, S, E, S, E, S, E], // row 5
      [B, E, F, B, C, E, E, E, C, E, E, E, C, B, F, E, E], // row 6
      [F, S, E, S, E, S, E, S, E, S, B, S, E, S, E, S, E], // row 7
      [E, E, E, B, E, E, E, E, E, E, E, E, B, E, E, E, E], // row 8
      [E, S, E, S, F, S, B, S, E, S, B, S, F, S, E, S, E], // row 9
      [E, E, E, B, C, B, E, B, E, B, E, B, C, B, E, E, E], // row 10
    ],
    items: [
      { col: 3, row: 2, type: 'KICK_BOOT', exposed: false },
      { col: 3, row: 4, type: 'THROW_GLOVE', exposed: false },
      { col: 3, row: 8, type: 'SPEED_UP', exposed: false },
      { col: 6, row: 1, type: 'FIRE_UP', exposed: false },
      { col: 10, row: 1, type: 'BOMB_UP', exposed: false },
    ],
    enemies: [
      { col: 6, row: 2, type: 'PHANTOM', dir: 'RIGHT' },
      { col: 10, row: 8, type: 'PHANTOM', dir: 'LEFT' },
      { col: 6, row: 8, type: 'SKELETON', dir: 'RIGHT' },
      { col: 10, row: 2, type: 'SKELETON', dir: 'LEFT' },
      { col: 14, row: 5, type: 'MAGMA_SLIME', dir: 'DOWN' },
    ],
    spikes: [
      { col: 7, row: 4, offset: 0 },
      { col: 9, row: 4, offset: 2.0 },
      { col: 7, row: 6, offset: 1.0 },
      { col: 9, row: 6, offset: 3.0 },
    ],
    teleporters: [{ id: 'tp-23', colA: 2, rowA: 5, colB: 14, rowB: 5, color: '#a855f7' }],
  },
  {
    code: '3-1',
    title: 'Màn 3-1: Đấu Trường Dung Nham (Map Rộng 17×11)',
    subtitle: 'Mức Khó — Quái Magma giáp dày (2 máu), Hành lang đôi & Dịch Chuyển.',
    difficulty: 'HARD',
    biome: 'VOLCANO',
    timeLimitSec: 165,
    initialBombs: 2,
    initialFire: 2,
    initialSpeed: 1,
    playerStart: { col: 0, row: 0 },
    player2Start: { col: 0, row: 10 },
    exitPos: { col: 15, row: 1 },
    grid: [
      //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
      [E, E, E, F, B, B, C, B, E, B, C, B, B, F, E, X, E], // row 0
      [E, S, E, S, F, S, B, S, E, S, B, S, F, S, E, E, E], // row 1
      [E, E, E, B, E, B, E, E, E, E, E, B, E, B, E, E, E], // row 2
      [E, S, E, S, B, S, E, S, E, S, E, S, B, S, E, S, E], // row 3
      [E, E, E, F, C, E, E, E, E, E, E, E, C, F, E, E, E], // row 4
      [E, S, E, S, E, S, E, S, E, S, E, S, E, S, E, S, E], // row 5
      [E, E, E, F, C, E, E, E, E, E, E, E, C, F, E, E, E], // row 6
      [E, S, E, S, B, S, E, S, E, S, E, S, B, S, E, S, E], // row 7
      [E, E, E, B, E, B, E, E, E, E, E, B, E, B, E, E, E], // row 8
      [E, S, E, S, F, S, B, S, E, S, B, S, F, S, E, S, E], // row 9
      [E, E, E, F, B, B, C, B, E, B, C, B, B, F, E, E, E], // row 10
    ],
    items: [
      { col: 3, row: 2, type: 'KICK_BOOT', exposed: false },
      { col: 5, row: 2, type: 'THROW_GLOVE', exposed: false },
      { col: 3, row: 8, type: 'SPEED_UP', exposed: false },
      { col: 6, row: 1, type: 'FIRE_UP', exposed: false },
      { col: 10, row: 1, type: 'BOMB_UP', exposed: false },
    ],
    enemies: [
      { col: 8, row: 2, type: 'MAGMA_SLIME', dir: 'RIGHT' },
      { col: 8, row: 8, type: 'MAGMA_SLIME', dir: 'RIGHT' },
      { col: 12, row: 2, type: 'PHANTOM', dir: 'LEFT' },
      { col: 12, row: 8, type: 'PHANTOM', dir: 'LEFT' },
      { col: 7, row: 4, type: 'SKELETON', dir: 'UP' },
      { col: 9, row: 6, type: 'SKELETON', dir: 'DOWN' },
    ],
    spikes: [
      { col: 6, row: 4, offset: 0 },
      { col: 10, row: 4, offset: 2.0 },
      { col: 6, row: 6, offset: 1.0 },
      { col: 10, row: 6, offset: 3.0 },
    ],
    teleporters: [
      { id: 'tp-31a', colA: 2, rowA: 4, colB: 14, rowB: 6, color: '#38bdf8' },
      { id: 'tp-31b', colA: 2, rowA: 6, colB: 14, rowB: 4, color: '#f97316' },
    ],
  },
  {
    code: '3-2',
    title: 'Màn 3-2: ĐẤU TRÙM VUA XƯƠNG (Map Rộng 17×11)',
    subtitle: 'Mức Khó (BOSS) — Đấu trường đại chiến Vua Xương 7 Máu & Vòng Bo Tử Thần!',
    difficulty: 'HARD',
    biome: 'VOLCANO',
    timeLimitSec: 175,
    initialBombs: 2,
    initialFire: 2,
    initialSpeed: 2,
    playerStart: { col: 0, row: 0 },
    player2Start: { col: 0, row: 10 },
    exitPos: { col: 15, row: 1 },
    grid: [
      //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
      [E, E, E, B, F, E, C, E, E, E, C, E, F, B, E, X, E], // row 0
      [E, S, E, S, B, S, E, S, E, S, E, S, B, S, E, E, E], // row 1
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E], // row 2
      [E, S, E, S, E, S, E, S, E, S, E, S, E, S, E, S, E], // row 3
      [E, E, E, E, C, E, E, E, E, E, E, E, C, E, E, E, E], // row 4
      [E, S, E, S, E, S, E, S, E, S, E, S, E, S, E, S, E], // row 5
      [E, E, E, E, C, E, E, E, E, E, E, E, C, E, E, E, E], // row 6
      [E, S, E, S, E, S, E, S, E, S, E, S, E, S, E, S, E], // row 7
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E], // row 8
      [E, S, E, S, B, S, E, S, E, S, E, S, B, S, E, S, E], // row 9
      [E, E, E, B, F, E, C, E, E, E, C, E, F, B, E, E, E], // row 10
    ],
    items: [
      { col: 4, row: 1, type: 'THROW_GLOVE', exposed: false },
      { col: 4, row: 9, type: 'KICK_BOOT', exposed: false },
      { col: 12, row: 1, type: 'FIRE_UP', exposed: false },
      { col: 12, row: 9, type: 'BOMB_UP', exposed: false },
    ],
    enemies: [
      { col: 8, row: 5, type: 'BOSS_KING', dir: 'LEFT' },
      { col: 10, row: 2, type: 'MAGMA_SLIME', dir: 'LEFT' },
      { col: 10, row: 8, type: 'MAGMA_SLIME', dir: 'LEFT' },
      { col: 14, row: 5, type: 'PHANTOM', dir: 'UP' },
    ],
    spikes: [
      { col: 6, row: 2, offset: 0 },
      { col: 6, row: 8, offset: 1.5 },
      { col: 10, row: 4, offset: 0.8 },
      { col: 10, row: 6, offset: 2.4 },
    ],
    teleporters: [
      { id: 'tp-boss-1', colA: 2, rowA: 2, colB: 14, rowB: 8, color: '#38bdf8' },
      { id: 'tp-boss-2', colA: 2, rowA: 8, colB: 14, rowB: 2, color: '#f59e0b' },
    ],
  },
];

export function getLevelById(code: string): LevelConfig {
  return LEVELS.find((l) => l.code === code) || LEVELS[0];
}
