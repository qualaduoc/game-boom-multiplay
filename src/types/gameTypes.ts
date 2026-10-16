export type TileType = 'EMPTY' | 'STONE' | 'BRICK' | 'BUSH' | 'CHEST' | 'EXIT';

export type ItemType =
  | 'BOMB_UP'
  | 'FIRE_UP'
  | 'SPEED_UP'
  | 'HEART'
  | 'KICK_BOOT'
  | 'THROW_GLOVE'
  | 'COIN_CHEST';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type EnemyType = 'SLIME' | 'SKELETON' | 'PHANTOM' | 'MAGMA_SLIME' | 'BOSS_KING';

export type DifficultyTier = 'EASY' | 'MEDIUM' | 'HARD';

export type BiomeType = 'FOREST' | 'RUINS' | 'VOLCANO';

export type HeroSkinId = 'KNIGHT_RED' | 'PALADIN_GOLD' | 'SHADOW_NINJA' | 'ARCANE_MAGE';

export type FlameColorId =
  | 'CLASSIC_ORANGE'
  | 'ICE_BLUE'
  | 'SHADOW_PURPLE'
  | 'EMERALD_TOXIC'
  | 'GOLDEN_SUN';

export type PlayerSlotId = 'P1' | 'P2' | 'P3' | 'P4';

export type GameStatus = 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

export interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  isGuest: boolean;
  coins: number;
  eloRating: number;
  wins: number;
  matchesPlayed: number;
  equippedSkin: HeroSkinId;
  equippedFlame: FlameColorId;
  unlockedSkins: HeroSkinId[];
  unlockedFlames: FlameColorId[];
}

export interface PlayerState {
  id: PlayerSlotId;
  displayName?: string;
  skin: HeroSkinId;
  flameColor: FlameColorId;
  isAiBot?: boolean;
  aiDecisionTimer?: number;
  x: number;
  y: number;
  dir: Direction;
  isMoving: boolean;
  animTime: number;
  hp: number;
  maxHp: number;
  maxBombs: number;
  fireRange: number;
  speedLevel: number;
  kickTimer: number;
  throwTimer: number;
  invulnerableTimer: number;
  teleportCooldown: number;
  isAlive: boolean;
  // Revenge Ghost Bomber (Bóng Ma Báo Thù when eliminated in Multi/Battle)
  isGhost: boolean;
  ghostBombCooldown: number;
  // In-Game Pixel Emote
  activeEmote?: string;
  emoteTimer: number;
}

export interface BombEntity {
  id: string;
  ownerId: PlayerSlotId;
  flameColor?: FlameColorId;
  isGhostCurse?: boolean;
  col: number;
  row: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  timer: number;
  maxTimer: number;
  range: number;
  ownerCanPass: boolean;
  isDemoSafe?: boolean;
  // Bomb Throw (Parabolic Arc over walls)
  isAirborne?: boolean;
  throwStartX?: number;
  throwStartY?: number;
  throwTargetCol?: number;
  throwTargetRow?: number;
  throwProgress?: number;
  throwDir?: Direction;
  zHeight?: number;
  teleportCooldown?: number;
}

export interface SpikeTrap {
  col: number;
  row: number;
  offset: number;
}

export interface TeleportPair {
  id: string;
  colA: number;
  rowA: number;
  colB: number;
  rowB: number;
  color: string;
}

export interface FlameCell {
  col: number;
  row: number;
  part: 'CENTER' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  isTip: boolean;
  timer: number;
  maxTimer: number;
  flameColor?: FlameColorId;
}

export interface FallingStoneWarning {
  col: number;
  row: number;
  timer: number;
}

export interface GroundItem {
  id: string;
  col: number;
  row: number;
  type: ItemType;
  spawnTime: number;
  immunityTimer: number;
}

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  dir: Direction;
  speed: number;
  hp: number;
  maxHp: number;
  animTime: number;
  aiTimer: number;
  hurtTimer: number;
  isChasing: boolean;
  canPassSoftWalls: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  highlightColor?: string;
  borderColor?: string;
  life: number;
  maxLife: number;
  gravity: number;
  kind: 'BRICK' | 'LEAF' | 'EMBER' | 'SPARKLE';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface LevelConfig {
  code: string;
  title: string;
  subtitle: string;
  difficulty: DifficultyTier;
  biome: BiomeType;
  timeLimitSec: number;
  initialBombs: number;
  initialFire: number;
  initialSpeed: number;
  playerStart: { col: number; row: number };
  player2Start?: { col: number; row: number };
  exitPos: { col: number; row: number };
  grid: TileType[][];
  items: { col: number; row: number; type: ItemType; exposed?: boolean }[];
  enemies: { col: number; row: number; type: EnemyType; dir?: Direction }[];
  spikes?: SpikeTrap[];
  teleporters?: TeleportPair[];
}

export interface LeaderboardEntry {
  id?: number;
  player_name: string;
  level_code: string;
  score: number;
  time_remaining_sec: number;
  created_at?: string;
}
