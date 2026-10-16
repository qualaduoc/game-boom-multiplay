import { HeroSkinId } from '../types/gameTypes';

const spriteCache = new Map<string, HTMLCanvasElement>();

export function drawMatrixSprite(
  ctx: CanvasRenderingContext2D,
  key: string,
  rows: string[],
  palette: Record<string, string>,
  cx: number,
  cy: number,
  pixelScale: number = 2,
  flipX: boolean = false
): void {
  const cacheKey = `${key}_${pixelScale}`;
  let offscreen = spriteCache.get(cacheKey);

  if (!offscreen && typeof document !== 'undefined') {
    const h = rows.length;
    const w = rows[0].length;
    offscreen = document.createElement('canvas');
    offscreen.width = w * pixelScale;
    offscreen.height = h * pixelScale;
    const octx = offscreen.getContext('2d');
    if (octx) {
      for (let r = 0; r < h; r++) {
        const line = rows[r];
        for (let c = 0; c < w; c++) {
          const ch = line[c];
          if (ch !== '.' && palette[ch]) {
            octx.fillStyle = palette[ch];
            octx.fillRect(c * pixelScale, r * pixelScale, pixelScale, pixelScale);
          }
        }
      }
    }
    spriteCache.set(cacheKey, offscreen);
  }

  if (!offscreen) return;

  const drawW = offscreen.width;
  const drawH = offscreen.height;
  if (flipX) {
    ctx.save();
    ctx.translate(Math.round(cx), Math.round(cy));
    ctx.scale(-1, 1);
    ctx.drawImage(offscreen, -drawW / 2, -drawH / 2);
    ctx.restore();
  } else {
    ctx.drawImage(offscreen, Math.round(cx - drawW / 2), Math.round(cy - drawH / 2));
  }
}

export interface HeroSkinMeta {
  id: HeroSkinId;
  name: string;
  bonusDesc: string;
  palette: Record<string, string>;
}

export const HERO_SKINS: Record<HeroSkinId, HeroSkinMeta> = {
  KNIGHT_RED: {
    id: 'KNIGHT_RED',
    name: 'Hiệp Sĩ Đỏ (Gốc)',
    bonusDesc: 'Cân bằng mọi chỉ số chuẩn mực',
    palette: {
      O: '#140c08',
      H: '#5e3219',
      h: '#804727',
      L: '#a66038',
      S: '#fcd5b4',
      s: '#e6ae87',
      W: '#ffffff',
      E: '#111827',
      R: '#dc2626',
      r: '#991b1b',
      B: '#2563eb',
      b: '#1d4ed8',
      Y: '#fbbf24',
      T: '#452311',
      t: '#6e3b1e',
    },
  },
  PALADIN_GOLD: {
    id: 'PALADIN_GOLD',
    name: 'Thánh Kỵ Sĩ Vàng',
    bonusDesc: '+1 Tốc độ di chuyển khởi đầu',
    palette: {
      O: '#171206',
      H: '#ca8a04',
      h: '#eab308',
      L: '#fef08a',
      S: '#fcd5b4',
      s: '#e6ae87',
      W: '#ffffff',
      E: '#0284c7',
      R: '#0284c7',
      r: '#0369a1',
      B: '#f59e0b',
      b: '#d97706',
      Y: '#fef9c3',
      T: '#78350f',
      t: '#b45309',
    },
  },
  SHADOW_NINJA: {
    id: 'SHADOW_NINJA',
    name: 'Ninja Bóng Đêm',
    bonusDesc: '+1 Số lượng Bom khởi đầu',
    palette: {
      O: '#09090b',
      H: '#18181b',
      h: '#27272a',
      L: '#52525b',
      S: '#fcd5b4',
      s: '#27272a', // Mask covering lower face
      W: '#ffffff',
      E: '#dc2626',
      R: '#e11d48',
      r: '#9f1239',
      B: '#1e1b4b',
      b: '#0f172a',
      Y: '#38bdf8',
      T: '#18181b',
      t: '#3f3f46',
    },
  },
  ARCANE_MAGE: {
    id: 'ARCANE_MAGE',
    name: 'Pháp Sư Lửa Thiêng',
    bonusDesc: '+1 Tầm nổ Lửa khởi đầu',
    palette: {
      O: '#0c191e',
      H: '#0f766e',
      h: '#14b8a6',
      L: '#99f6e4',
      S: '#fcd5b4',
      s: '#e6ae87',
      W: '#ffffff',
      E: '#f59e0b',
      R: '#f97316',
      r: '#c2410c',
      B: '#0d9488',
      b: '#115e59',
      Y: '#fde047',
      T: '#3b0764',
      t: '#581c87',
    },
  },
};

export const HERO_IDLE_MATRIX: string[] = [
  '......OOOOOOO.......',
  '....OOHLLLLLHOO.....',
  '...OHhLLLLLLLhHO....',
  '..OHhhhhhhhhhhhHO...',
  '.OOHhHHHHHHHHhHhOO..',
  '.OHhHSSSSSSSSSHhHO..',
  '..OHSSWESSWESSHHO...',
  '..OHSSEESSEESSSHO...',
  '...OSSSSSSSSssSO....',
  '..OORRRRRRRRRRRO....',
  '.OORrRRRRRRRRRRRO...',
  'OORrrROBBBBBBORRO...',
  'ORrrrOBBBBBBBBORO...',
  'ORrrRObBYYYYBbORO...',
  '.OOOOObBBBBBBbOO....',
  '.....OObBBBBbOO.....',
  '.....OTtOOOOtTO.....',
  '.....OTTO..OTTO.....',
  '.....OOOO..OOOO.....',
  '....................',
];

export const HERO_WALK1_MATRIX: string[] = [
  '......OOOOOOO.......',
  '....OOHLLLLLHOO.....',
  '...OHhLLLLLLLhHO....',
  '..OHhhhhhhhhhhhHO...',
  '.OOHhHHHHHHHHhHhOO..',
  '.OHhHSSSSSSSSSHhHO..',
  '..OHSSWESSWESSHHO...',
  '..OHSSEESSEESSSHO...',
  '...OSSSSSSSSssSO....',
  '.OOORRRRRRRRRRRO....',
  'OORrrRRRRRRRRRRRO...',
  'ORrrrROBBBBBBORRO...',
  'ORrrROBBBBBBBBORO...',
  '.OOOOObBYYYYBbOO....',
  '.....OObBBBBbOO.....',
  '....OTtO....OTtO....',
  '....OTTO....OTTO....',
  '....OOOO....OOOO....',
  '....................',
  '....................',
];

export const SLIME_PALETTE: Record<string, string> = {
  O: '#091e47',
  D: '#1565c0',
  M: '#1e88e5',
  L: '#42a5f5',
  H: '#90caf9',
  W: '#ffffff',
  E: '#0a1120',
};

export const MAGMA_SLIME_PALETTE: Record<string, string> = {
  O: '#3b0707',
  D: '#b91c1c',
  M: '#ea580c',
  L: '#f97316',
  H: '#fde047',
  W: '#ffffff',
  E: '#1c0505',
};

export const SLIME_MATRIX: string[] = [
  '....................',
  '........OOOO........',
  '......OOLLLLOO......',
  '....OOLLHWWLLLOO....',
  '...OLLMHWLLLLLLOO...',
  '..OLLMHHLLLLLLLLOO..',
  '..OLMMMMMMMMMMMMLO..',
  '.OOLMMWEMMMMWEMMLOO.',
  '.OLMMMEEMMMMEEMMMLO.',
  '.OLMMMEEMMMMEEMMMLO.',
  '.ODMMMMMMMMMMMMMMDO.',
  '.ODDMMMMMMMMMMMMDDO.',
  '..ODDDDDDDDDDDDDDO..',
  '...OOOOOOOOOOOOOO...',
  '....................',
];

export const SKELETON_PALETTE: Record<string, string> = {
  O: '#0f172a',
  W: '#ffffff',
  S: '#f1f5f9',
  G: '#cbd5e1',
  D: '#64748b',
  R: '#ef4444',
  I: '#e2e8f0',
  Y: '#f59e0b',
};

export const SKELETON_MATRIX: string[] = [
  '.....OOOOOOOOOO.....',
  '....OOWWWWWWWWOO....',
  '...OOWSSSSSSSSWOO...',
  '..OOSSSSSSSSSSSSOO..',
  '..OSSSGOOSSOOGSSSO..',
  '..OSSSOORSSOORSSSO..',
  '..OSSSOOOSSOOOSSSO..',
  '...OSSSSGGGGSSSSO...',
  '..OOOGGSOOOOSGGOO...',
  '.OIIO..OOOOOO..OO...',
  '.OIIO.OSGGGGSO.OSO..',
  '.OIIO.OSSSSSSO.OSO..',
  'OOYYOO.OSGGSO..OO...',
  '.OOOO..OSSSSO.......',
  '......OOG..GOO......',
  '......OSG..GSO......',
  '......OOO..OOO......',
  '....................',
];

export const PHANTOM_PALETTE: Record<string, string> = {
  O: '#1e1b4b',
  D: '#4338ca',
  M: '#6366f1',
  L: '#a5b4fc',
  W: '#e0e7ff',
  R: '#fef08a',
};

export const PHANTOM_MATRIX: string[] = [
  '......OOOOOOOO......',
  '....OOLLLLLLLLOO....',
  '...OLLWWWWWWWWLLO...',
  '..OLLWLLLLLLLLWLLO..',
  '..OLMLLOOLLOOLLMLO..',
  '..OLMLLORLLORLLMLO..',
  '..OLMMMMMMMMMMMMLO..',
  '..ODMMMMMMMMMMMMDO..',
  '..ODDMMMMMMMMMMDDO..',
  '...ODDDDDDDDDDDDO...',
  '...ODDO.ODDO.ODDO...',
  '...OOO..OOO..OOO....',
];

export const BOSS_KING_PALETTE: Record<string, string> = {
  O: '#090d16',
  Y: '#fbbf24',
  y: '#d97706',
  R: '#ef4444',
  r: '#991b1b',
  W: '#ffffff',
  S: '#f1f5f9',
  G: '#94a3b8',
  I: '#38bdf8',
};

export const BOSS_KING_MATRIX: string[] = [
  '....OO..OOOO..OO....',
  '....OYYOYYYYOYYO....',
  '....OYYYYRRYYYYO....',
  '...OOyyyyyyyyyyOO...',
  '..OOWWWWWWWWWWWWOO..',
  '.OOWSSSSSSSSSSSSWOO.',
  '.OSSSSOOOSSSOOOSSSO.',
  '.OSSSOORRSSORROSSSO.',
  '..OSSSSGGGGGGSSSSO..',
  '.OORRRRRRRRRRRRRROO.',
  'OIIORrrGGGGGGrrROIIO',
  'OIIORrGGGGGGGGGrOIIO',
  'OYYORrGYYYYYYGrROYYO',
  '.OOORrGGGGGGGGGrOOO.',
  '....OOSSGGGGSSOO....',
  '.....OSSO..OSSO.....',
  '.....OOOO..OOOO.....',
];
