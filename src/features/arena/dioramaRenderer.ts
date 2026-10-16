import {
  BIOME_THEMES,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DIORAMA_PAD_LEFT,
  DIORAMA_PAD_TOP,
  FLAME_PALETTES,
  GRID_COLS,
  GRID_ROWS,
  PALETTE,
  TILE_SIZE,
} from '../../constants/gameConstants';
import { BiomeType, FallingStoneWarning, FlameCell, Particle } from '../../types/gameTypes';
import { drawPixelRect } from '../../utils/pixelSprites';

export function drawPixelTree(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  biome: BiomeType,
  scale: number = 1
): void {
  const s = scale;
  const theme = BIOME_THEMES[biome];

  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 22 * s, 25 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tree Trunk with bark shading
  drawPixelRect(ctx, cx - 7 * s, cy + 4 * s, 14 * s, 18 * s, '#2e180b');
  drawPixelRect(ctx, cx - 5 * s, cy + 5 * s, 10 * s, 16 * s, '#6b3e23');
  drawPixelRect(ctx, cx - 3 * s, cy + 6 * s, 4 * s, 14 * s, '#8c5532');

  // Multi-tiered lush pixel canopy
  const layers = [
    { y: -4, w: 48, h: 20 },
    { y: -16, w: 38, h: 18 },
    { y: -26, w: 26, h: 14 },
  ];
  layers.forEach((l) => {
    drawPixelRect(
      ctx,
      cx - (l.w / 2 + 2) * s,
      cy + (l.y - 2) * s,
      (l.w + 4) * s,
      (l.h + 4) * s,
      theme.treeShadow
    );
    drawPixelRect(ctx, cx - (l.w / 2) * s, cy + l.y * s, l.w * s, l.h * s, theme.treeMain);
    drawPixelRect(
      ctx,
      cx - (l.w / 2 - 5) * s,
      cy + (l.y + 2) * s,
      (l.w - 10) * s,
      5 * s,
      theme.treeHighlight
    );
  });
}

export function drawExitArchway(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  isUnlocked: boolean
): void {
  const ax = x - 6;
  const ay = y - 22;
  const aw = size + 12;
  const ah = size + 22;

  // Stepping stone path below portal
  for (let i = 0; i < 3; i++) {
    const sy = y + size + i * 14 + 2;
    drawPixelRect(ctx, x + 5, sy, 16, 10, '#64748b');
    drawPixelRect(ctx, x + 25, sy + 2, 16, 10, '#64748b');
    drawPixelRect(ctx, x + 7, sy + 1, 12, 4, '#cbd5e1');
    drawPixelRect(ctx, x + 27, sy + 3, 12, 4, '#cbd5e1');
  }

  // Stone Arch Structure
  drawPixelRect(ctx, ax, ay + 8, aw, ah - 8, '#1e293b');
  drawPixelRect(ctx, ax + 4, ay + 4, aw - 8, ah - 4, '#64748b');
  drawPixelRect(ctx, ax + 6, ay + 6, aw - 12, ah - 8, '#94a3b8');

  drawPixelRect(ctx, ax + 4, ay + 20, aw - 8, 2, '#334155');
  drawPixelRect(ctx, ax + 4, ay + 34, aw - 8, 2, '#334155');
  drawPixelRect(ctx, ax + 4, ay + 48, aw - 8, 2, '#334155');

  // Glowing Inner Portal Doorway
  drawPixelRect(ctx, x + 6, y - 4, size - 12, size + 2, '#2b0e02');
  drawPixelRect(ctx, x + 8, y - 2, size - 16, size, isUnlocked ? '#ea580c' : '#7c2d12');
  drawPixelRect(ctx, x + 11, y + 4, size - 22, size - 6, isUnlocked ? '#f97316' : '#9a3412');
  drawPixelRect(ctx, x + 14, y + 11, size - 28, size - 13, isUnlocked ? '#facc15' : '#ea580c');
  drawPixelRect(ctx, x + 17, y + 19, size - 34, size - 21, '#fef9c3');

  // "EXIT" Golden Signboard on top
  const sx = x + 6;
  const sy = ay - 4;
  drawPixelRect(ctx, sx - 2, sy - 2, size - 8, 18, '#451a03');
  drawPixelRect(ctx, sx, sy, size - 12, 14, '#f59e0b');
  drawPixelRect(ctx, sx + 2, sy + 2, size - 16, 10, '#fde047');

  ctx.fillStyle = '#451a03';
  ctx.font = 'bold 9px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', x + size / 2, sy + 11);

  if (isUnlocked) {
    const bounce = Math.sin(time * 8) * 3;
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.fillText('▼ OPEN ▼', x + size / 2, ay - 9 + bounce);
  }
}

export function drawDioramaEnvironment(
  ctx: CanvasRenderingContext2D,
  time: number,
  biome: BiomeType,
  exitPos: { col: number; row: number },
  isExitUnlocked: boolean
): void {
  const theme = BIOME_THEMES[biome];
  drawPixelRect(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, theme.outerBg);

  const arenaX = DIORAMA_PAD_LEFT;
  const arenaY = DIORAMA_PAD_TOP;
  const arenaW = GRID_COLS * TILE_SIZE;
  const arenaH = GRID_ROWS * TILE_SIZE;

  // Outer Bevelled Stone Perimeter Wall
  const wallThickness = 28;
  for (let wx = arenaX - 24; wx < arenaX + arenaW + 24; wx += 36) {
    drawPixelRect(ctx, wx, arenaY - wallThickness, 36, wallThickness, '#1e293b');
    drawPixelRect(ctx, wx + 2, arenaY - wallThickness + 2, 32, wallThickness - 6, '#94a3b8');
    drawPixelRect(ctx, wx + 2, arenaY - wallThickness + 2, 32, 6, '#cbd5e1');
    drawPixelRect(ctx, wx + 2, arenaY - 8, 32, 6, '#64748b');
  }
  for (let wx = arenaX + 180; wx < arenaX + arenaW + 24; wx += 36) {
    const by = arenaY + arenaH;
    drawPixelRect(ctx, wx, by, 36, wallThickness, '#1e293b');
    drawPixelRect(ctx, wx + 2, by + 2, 32, wallThickness - 6, '#94a3b8');
    drawPixelRect(ctx, wx + 2, by + 2, 32, 6, '#cbd5e1');
    drawPixelRect(ctx, wx + 2, by + wallThickness - 8, 32, 6, '#64748b');
  }
  for (let wy = arenaY - 12; wy < arenaY + arenaH + 12; wy += 36) {
    const rx = arenaX + arenaW;
    drawPixelRect(ctx, rx, wy, wallThickness, 36, '#1e293b');
    drawPixelRect(ctx, rx + 2, wy + 2, wallThickness - 6, 32, '#94a3b8');
    if (wy < arenaY + arenaH * 0.5) {
      const lx = arenaX - wallThickness;
      drawPixelRect(ctx, lx, wy, wallThickness, 36, '#1e293b');
      drawPixelRect(ctx, lx + 2, wy + 2, wallThickness - 6, 32, '#94a3b8');
    }
  }

  // Checkerboard Arena Floor
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const tx = arenaX + c * TILE_SIZE;
      const ty = arenaY + r * TILE_SIZE;
      const isLight = (r + c) % 2 === 0;
      drawPixelRect(ctx, tx, ty, TILE_SIZE, TILE_SIZE, isLight ? theme.grassLight : theme.grassDark);

      const seed = (r * 19 + c * 31) % 8;
      if (seed === 0) {
        drawPixelRect(ctx, tx + 10, ty + 12, 2, 4, theme.grassDetail);
        drawPixelRect(ctx, tx + 13, ty + 13, 2, 3, theme.grassDetail);
      } else if (seed === 3) {
        drawPixelRect(ctx, tx + 32, ty + 28, 3, 3, '#fef08a');
        drawPixelRect(ctx, tx + 33, ty + 31, 2, 3, theme.grassDetail);
      }
    }
  }

  // Bottom-Left Flowing River & Wooden Bridge
  const riverStartY = arenaY + arenaH * 0.52;
  ctx.fillStyle = theme.waterDeep;
  ctx.beginPath();
  ctx.moveTo(0, riverStartY);
  ctx.lineTo(arenaX + 12, riverStartY + 18);
  ctx.lineTo(arenaX + 26, arenaY + arenaH - 10);
  ctx.lineTo(arenaX + 210, CANVAS_HEIGHT);
  ctx.lineTo(0, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = theme.waterMid;
  ctx.beginPath();
  ctx.moveTo(0, riverStartY + 10);
  ctx.lineTo(arenaX + 4, riverStartY + 26);
  ctx.lineTo(arenaX + 18, arenaY + arenaH - 4);
  ctx.lineTo(arenaX + 190, CANVAS_HEIGHT);
  ctx.lineTo(0, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  const waveShift = (time * 24) % 28;
  for (let i = 0; i < 6; i++) {
    const wx = 12 + ((i * 26 + waveShift) % 85);
    const wy = riverStartY + 35 + i * 32;
    drawPixelRect(ctx, wx, wy, 14, 3, theme.waterFoam);
    drawPixelRect(ctx, wx + 6, wy + 8, 8, 2, '#ffffff');
  }

  // Wooden Bridge over River
  const bridgeX = 10;
  const bridgeY = arenaY + arenaH - 92;
  const bridgeW = arenaX + 8;
  const bridgeH = 38;
  drawPixelRect(ctx, bridgeX, bridgeY, bridgeW, bridgeH, PALETTE.woodDark);
  for (let px = bridgeX + 2; px < bridgeX + bridgeW - 4; px += 10) {
    drawPixelRect(ctx, px, bridgeY + 3, 8, bridgeH - 6, PALETTE.woodBase);
    drawPixelRect(ctx, px + 1, bridgeY + 4, 6, 6, PALETTE.woodLight);
  }
  [bridgeX + 4, bridgeX + bridgeW - 12].forEach((postX) => {
    drawPixelRect(ctx, postX, bridgeY - 8, 10, 12, PALETTE.woodDark);
    drawPixelRect(ctx, postX + 2, bridgeY - 6, 6, 8, PALETTE.woodLight);
    drawPixelRect(ctx, postX, bridgeY + bridgeH - 4, 10, 12, PALETTE.woodDark);
    drawPixelRect(ctx, postX + 2, bridgeY + bridgeH - 2, 6, 8, PALETTE.woodLight);
  });

  // Wooden Fence (Top-Left) & Barrels (Right)
  const fenceX = arenaX - 24;
  const fenceY = arenaY + TILE_SIZE * 1.4;
  drawPixelRect(ctx, fenceX, fenceY, 8, 30, PALETTE.woodDark);
  drawPixelRect(ctx, fenceX + 22, fenceY, 8, 30, PALETTE.woodDark);
  drawPixelRect(ctx, fenceX - 2, fenceY + 6, 34, 6, PALETTE.woodBase);
  drawPixelRect(ctx, fenceX - 2, fenceY + 18, 34, 6, PALETTE.woodBase);

  const barrelX = arenaX + arenaW + 6;
  const barrelY = arenaY + TILE_SIZE * 4.3;
  drawPixelRect(ctx, barrelX, barrelY, 26, 34, '#451a03');
  drawPixelRect(ctx, barrelX + 2, barrelY + 2, 22, 30, '#9a3412');
  drawPixelRect(ctx, barrelX + 2, barrelY + 9, 22, 4, '#334155');
  drawPixelRect(ctx, barrelX + 2, barrelY + 21, 22, 4, '#334155');

  // EXIT Archway Portal
  const exitScreenX = arenaX + exitPos.col * TILE_SIZE;
  const exitScreenY = arenaY + (exitPos.row - 1) * TILE_SIZE;
  drawExitArchway(ctx, exitScreenX, exitScreenY, TILE_SIZE, time, isExitUnlocked);

  // Scenic Trees (Strictly placed on outer diorama margin so they never cover playable tiles!)
  drawPixelTree(ctx, arenaX - 30, arenaY + 8, biome, 0.95);
  drawPixelTree(ctx, arenaX - 30, arenaY + TILE_SIZE * 4.2, biome, 0.95);
  drawPixelTree(ctx, arenaX + 38, arenaY + arenaH + 18, biome, 0.9);
  drawPixelTree(ctx, arenaX + arenaW + 30, arenaY + 12, biome, 0.95);
  drawPixelTree(ctx, arenaX + arenaW + 30, arenaY + TILE_SIZE * 6.5, biome, 0.95);
  drawPixelTree(ctx, arenaX + arenaW - 14, arenaY + arenaH + 16, biome, 0.9);
}

export function drawFlameCross(ctx: CanvasRenderingContext2D, flames: FlameCell[]): void {
  const arenaX = DIORAMA_PAD_LEFT;
  const arenaY = DIORAMA_PAD_TOP;

  flames.forEach((f) => {
    const x = arenaX + f.col * TILE_SIZE;
    const y = arenaY + f.row * TILE_SIZE;
    const cx = x + TILE_SIZE / 2;
    const cy = y + TILE_SIZE / 2;
    const progress = f.timer / f.maxTimer;
    const scale = Math.min(1.08, Math.sin(progress * Math.PI) * 1.4);
    const pal = FLAME_PALETTES[f.flameColor || 'CLASSIC_ORANGE'] || FLAME_PALETTES.CLASSIC_ORANGE;

    const rOuter = 22 * scale;
    const rMid = 17 * scale;
    const rInner = 12 * scale;
    const rCore = 7.5 * scale;

    // 1. Outer scalloped cloud
    ctx.fillStyle = pal.outer;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.arc(cx - 7, cy - 5, rOuter * 0.72, 0, Math.PI * 2);
    ctx.arc(cx + 7, cy + 5, rOuter * 0.72, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy - 6, rOuter * 0.7, 0, Math.PI * 2);
    ctx.arc(cx - 6, cy + 6, rOuter * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 2. Mid flame layer
    ctx.fillStyle = pal.mid;
    ctx.beginPath();
    ctx.arc(cx, cy, rMid, 0, Math.PI * 2);
    ctx.fill();
    drawPixelRect(ctx, x + 4, y + 8, TILE_SIZE - 8, TILE_SIZE - 16, pal.mid);
    drawPixelRect(ctx, x + 8, y + 4, TILE_SIZE - 16, TILE_SIZE - 8, pal.mid);

    // 3. Hot plasma body
    ctx.fillStyle = pal.inner;
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
    ctx.fill();
    drawPixelRect(ctx, x + 8, y + 12, TILE_SIZE - 16, TILE_SIZE - 24, pal.inner);
    drawPixelRect(ctx, x + 12, y + 8, TILE_SIZE - 24, TILE_SIZE - 16, pal.inner);

    // 4. Blinding core
    ctx.fillStyle = pal.core;
    ctx.beginPath();
    ctx.arc(cx, cy, rCore, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawSuddenDeathWarnings(
  ctx: CanvasRenderingContext2D,
  warnings: FallingStoneWarning[],
  elapsedTime: number
): void {
  const arenaX = DIORAMA_PAD_LEFT;
  const arenaY = DIORAMA_PAD_TOP;

  warnings.forEach((w) => {
    const x = arenaX + w.col * TILE_SIZE;
    const y = arenaY + w.row * TILE_SIZE;
    const cx = x + TILE_SIZE / 2;
    const cy = y + TILE_SIZE / 2;
    const flash = Math.floor(elapsedTime * 12) % 2 === 0;

    ctx.fillStyle = flash ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.25)';
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

    ctx.strokeStyle = flash ? '#ef4444' : '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️', cx, cy + 4);
  });
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  particles.forEach((p) => {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    if (p.borderColor) {
      drawPixelRect(ctx, p.x - 1, p.y - 1, p.size + 2, p.size + 2, p.borderColor);
    }
    drawPixelRect(ctx, p.x, p.y, p.size, p.size, p.color);
    if (p.highlightColor) {
      drawPixelRect(ctx, p.x, p.y, Math.max(2, p.size - 2), 2, p.highlightColor);
    }
  });
  ctx.globalAlpha = 1;
}
