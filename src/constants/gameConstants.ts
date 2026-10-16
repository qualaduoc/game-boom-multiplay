import { BiomeType, FlameColorId } from '../types/gameTypes';

export const GRID_COLS = 17;
export const GRID_ROWS = 11;
export const TILE_SIZE = 44;

export const DIORAMA_PAD_LEFT = 62;
export const DIORAMA_PAD_RIGHT = 62;
export const DIORAMA_PAD_TOP = 38;
export const DIORAMA_PAD_BOTTOM = 38;

export const CANVAS_WIDTH = GRID_COLS * TILE_SIZE + DIORAMA_PAD_LEFT + DIORAMA_PAD_RIGHT;
export const CANVAS_HEIGHT = GRID_ROWS * TILE_SIZE + DIORAMA_PAD_TOP + DIORAMA_PAD_BOTTOM;

export const BASE_PLAYER_SPEED = 3.65; // tiles per second
export const SPEED_BOOST_PER_LEVEL = 0.55;
export const MAX_SPEED_LEVEL = 5;
export const MAX_BOMB_CAPACITY = 8;
export const MAX_FIRE_RANGE = 7;

export const BOMB_FUSE_SECONDS = 2.4;
export const BOMB_SLIDE_SPEED = 6.8; // tiles per second when kicked
export const FLAME_DURATION_SECONDS = 0.55;
export const PLAYER_INVULNERABLE_SECONDS = 2.0;

export const SUDDEN_DEATH_START_SEC = 45; // Last 45 seconds triggers Falling Stones

export const PIXEL_EMOTES = ['😂', '🔥', '💀', '👑'] as const;

export const FUNNY_GUEST_NICKNAMES = [
  'THÁNH_BOM_MÙ',
  'TRÙM_TỰ_HUỶ',
  'CHÚA_HỀ_PIXEL',
  'ĐẶT_XONG_CHẠY',
  'BOM_XỊT_PRO',
  'VUA_PHÁ_GẠCH',
  'GÀ_NHƯNG_GÁY',
  'BÓP_TEAM_SỐ_1',
  'NÉ_BOM_THẦN_SẦU',
  'THÁNH_KS_RƯƠNG',
  'CỤ_TỔ_LẠC_ĐƯỜNG',
  'HIỆP_SĨ_LƯỜI',
  'MA_XÓ_BÁO_THÙ',
  'TRÙM_NÚP_BỤI',
  'KẺ_DIỆT_BỤI_CỎ',
  'CHẠY_TỤT_DÉP',
] as const;

export function rollFunnyNickname(current?: string): string {
  const candidates = FUNNY_GUEST_NICKNAMES.filter((name) => name !== current);
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx] || FUNNY_GUEST_NICKNAMES[0];
}

export const FLAME_PALETTES: Record<
  FlameColorId,
  {
    name: string;
    price: number;
    outer: string;
    mid: string;
    inner: string;
    core: string;
  }
> = {
  CLASSIC_ORANGE: {
    name: 'Lửa Cam Cổ Điển',
    price: 0,
    outer: '#c2410c',
    mid: '#f97316',
    inner: '#facc15',
    core: '#fef9c3',
  },
  ICE_BLUE: {
    name: 'Băng Hàn Tuyệt Đối',
    price: 200,
    outer: '#0369a1',
    mid: '#0ea5e9',
    inner: '#38bdf8',
    core: '#e0f2fe',
  },
  SHADOW_PURPLE: {
    name: 'Hắc Hỏa Hư Không',
    price: 300,
    outer: '#4c1d95',
    mid: '#7c3aed',
    inner: '#c084fc',
    core: '#f3e8ff',
  },
  EMERALD_TOXIC: {
    name: 'Lục Hỏa Độc Dược',
    price: 350,
    outer: '#065f46',
    mid: '#10b981',
    inner: '#6ee7b7',
    core: '#ecfdf5',
  },
  GOLDEN_SUN: {
    name: 'Kim Hỏa Thái Dương',
    price: 500,
    outer: '#b45309',
    mid: '#f59e0b',
    inner: '#fde047',
    core: '#ffffff',
  },
};

export const SCORE_VALUES = {
  BRICK_DESTROY: 50,
  BUSH_DESTROY: 30,
  CHEST_OPEN: 500,
  ITEM_PICKUP: 150,
  SLIME_KILL: 250,
  SKELETON_KILL: 450,
  PHANTOM_KILL: 550,
  MAGMA_KILL: 650,
  BOSS_KILL: 2500,
  LEVEL_CLEAR_BASE: 1000,
  TIME_BONUS_PER_SEC: 10,
} as const;

export const PALETTE = {
  hudBg: '#0d1526',
  hudBoxBg: '#152238',
  hudBorderOuter: '#283d63',
  hudBorderInner: '#4c70a8',
  grassLight: '#5ab552',
  grassDark: '#4ca244',
  grassShadow: '#3d8737',
  stoneBase: '#8791a1',
  stoneLight: '#b2bccb',
  stoneDark: '#565f6e',
  brickBase: '#cc5b35',
  brickLight: '#e67d57',
  brickMortar: '#6e2813',
  bushBase: '#287233',
  bushLight: '#46a852',
  bushDark: '#194d21',
  waterDeep: '#1565c0',
  waterMid: '#1e88e5',
  waterFoam: '#bbdefb',
  woodBase: '#9c6234',
  woodLight: '#bd804e',
  woodDark: '#633a19',
} as const;

export const BIOME_THEMES: Record<
  BiomeType,
  {
    outerBg: string;
    grassLight: string;
    grassDark: string;
    grassDetail: string;
    waterDeep: string;
    waterMid: string;
    waterFoam: string;
    treeMain: string;
    treeHighlight: string;
    treeShadow: string;
  }
> = {
  FOREST: {
    outerBg: '#265c2c',
    grassLight: '#5bb653',
    grassDark: '#4ca344',
    grassDetail: '#3a8433',
    waterDeep: '#1565c0',
    waterMid: '#1e88e5',
    waterFoam: '#bbdefb',
    treeMain: '#267330',
    treeHighlight: '#5ec468',
    treeShadow: '#133818',
  },
  RUINS: {
    outerBg: '#3d3522',
    grassLight: '#849b46',
    grassDark: '#728839',
    grassDetail: '#586b29',
    waterDeep: '#0f5c5c',
    waterMid: '#147a7a',
    waterFoam: '#99f6e4',
    treeMain: '#b45309',
    treeHighlight: '#f59e0b',
    treeShadow: '#451a03',
  },
  VOLCANO: {
    outerBg: '#271212',
    grassLight: '#47393b',
    grassDark: '#3b2e30',
    grassDetail: '#261c1d',
    waterDeep: '#991b1b',
    waterMid: '#ea580c',
    waterFoam: '#fde047',
    treeMain: '#44403c',
    treeHighlight: '#78716c',
    treeShadow: '#1c1917',
  },
};
