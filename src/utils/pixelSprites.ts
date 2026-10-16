import {
  Direction,
  EnemyEntity,
  HeroSkinId,
  ItemType,
  SpikeTrap,
  TeleportPair,
  TileType,
} from '../types/gameTypes';
import {
  BOSS_KING_MATRIX,
  BOSS_KING_PALETTE,
  drawMatrixSprite,
  HERO_IDLE_MATRIX,
  HERO_SKINS,
  HERO_WALK1_MATRIX,
  MAGMA_SLIME_PALETTE,
  PHANTOM_MATRIX,
  PHANTOM_PALETTE,
  SKELETON_MATRIX,
  SKELETON_PALETTE,
  SLIME_MATRIX,
  SLIME_PALETTE,
} from './pixelArtMatrix';

export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function getSpikePhase(elapsedTime: number, offset: number): 'SAFE' | 'WARN' | 'ACTIVE' {
  const cycle = (elapsedTime + offset) % 4.0;
  if (cycle < 2.3) return 'SAFE';
  if (cycle < 3.0) return 'WARN';
  return 'ACTIVE';
}

export function drawSpikeTrapTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  trap: SpikeTrap,
  elapsedTime: number
): void {
  const phase = getSpikePhase(elapsedTime, trap.offset);
  // Metallic floor plate
  drawPixelRect(ctx, x + 5, y + 5, size - 10, size - 10, '#1e293b');
  drawPixelRect(ctx, x + 7, y + 7, size - 14, size - 14, '#334155');

  const holes = [
    { hx: 13, hy: 13 },
    { hx: 29, hy: 13 },
    { hx: 21, hy: 22 },
    { hx: 13, hy: 31 },
    { hx: 29, hy: 31 },
  ];

  holes.forEach(({ hx, hy }) => {
    drawPixelRect(ctx, x + hx - 3, y + hy - 2, 6, 5, '#090d16');
    if (phase === 'WARN') {
      drawPixelRect(ctx, x + hx - 2, y + hy - 4, 4, 4, '#f59e0b');
    } else if (phase === 'ACTIVE') {
      // Sharp steel spike protruding upward
      drawPixelRect(ctx, x + hx - 3, y + hy - 9, 6, 9, '#94a3b8');
      drawPixelRect(ctx, x + hx - 2, y + hy - 12, 4, 11, '#e2e8f0');
      drawPixelRect(ctx, x + hx - 1, y + hy - 14, 2, 5, '#ffffff');
      drawPixelRect(ctx, x + hx - 2, y + hy - 3, 4, 2, '#ef4444');
    }
  });
}

export function drawTeleporterTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  pair: TeleportPair,
  elapsedTime: number
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const pulse = 1 + Math.sin(elapsedTime * 7) * 0.1;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 19, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = pair.color || '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 16 * pulse, 10 * pulse, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 8 * pulse, 5 * pulse, 0, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting rune sparks
  const angle = elapsedTime * 5;
  const sx = cx + Math.cos(angle) * 14;
  const sy = cy + Math.sin(angle) * 8;
  drawPixelRect(ctx, sx - 2, sy - 2, 4, 4, '#fde047');
}

export function drawTileObstacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: TileType,
  time: number
): void {
  if (type === 'STONE') {
    drawPixelRect(ctx, x + 2, y + size - 3, size - 2, 5, 'rgba(0,0,0,0.36)');
    drawPixelRect(ctx, x + 2, y + 1, size - 4, size - 3, '#1e2430');
    drawPixelRect(ctx, x + 1, y + 2, size - 2, size - 5, '#1e2430');
    drawPixelRect(ctx, x + 3, y + 3, size - 6, size - 7, '#8792a3');
    drawPixelRect(ctx, x + 3, y + 3, size - 6, 5, '#c2cce0');
    drawPixelRect(ctx, x + 3, y + 3, 5, size - 7, '#aeb9cc');
    drawPixelRect(ctx, x + 5, y + 5, 6, 2, '#e2e8f0');
    drawPixelRect(ctx, x + 3, y + size - 10, size - 6, 6, '#525b6b');
    drawPixelRect(ctx, x + size - 8, y + 8, 5, size - 12, '#5e687a');
    drawPixelRect(ctx, x + 14, y + 11, 6, 2, '#525b6b');
    drawPixelRect(ctx, x + 18, y + 13, 4, 2, '#525b6b');
    drawPixelRect(ctx, x + 20, y + 15, 2, 5, '#525b6b');
    drawPixelRect(ctx, x + 27, y + 27, 8, 2, '#525b6b');
    return;
  }

  if (type === 'BRICK') {
    drawPixelRect(ctx, x + 2, y + size - 3, size - 2, 5, 'rgba(0,0,0,0.35)');
    drawPixelRect(ctx, x + 2, y + 1, size - 4, size - 3, '#2e1108');
    drawPixelRect(ctx, x + 1, y + 2, size - 2, size - 5, '#2e1108');
    drawPixelRect(ctx, x + 3, y + 3, size - 6, size - 7, '#cc5833');
    drawPixelRect(ctx, x + 3, y + 3, size - 6, 3, '#f08c67');
    drawPixelRect(ctx, x + 3, y + size - 7, size - 6, 3, '#8f3418');

    const rows = [13, 23, 33];
    rows.forEach((ry) => drawPixelRect(ctx, x + 3, y + ry, size - 6, 2, '#4f1c0d'));
    drawPixelRect(ctx, x + 18, y + 3, 2, 10, '#4f1c0d');
    drawPixelRect(ctx, x + 34, y + 3, 2, 10, '#4f1c0d');
    drawPixelRect(ctx, x + 10, y + 15, 2, 8, '#4f1c0d');
    drawPixelRect(ctx, x + 26, y + 15, 2, 8, '#4f1c0d');
    drawPixelRect(ctx, x + 20, y + 25, 2, 8, '#4f1c0d');
    drawPixelRect(ctx, x + 36, y + 25, 2, 8, '#4f1c0d');
    drawPixelRect(ctx, x + 13, y + 35, 2, 7, '#4f1c0d');
    drawPixelRect(ctx, x + 29, y + 35, 2, 7, '#4f1c0d');
    drawPixelRect(ctx, x + 5, y + 15, 4, 2, '#f08c67');
    drawPixelRect(ctx, x + 13, y + 15, 11, 2, '#f08c67');
    drawPixelRect(ctx, x + 29, y + 15, 12, 2, '#f08c67');
    drawPixelRect(ctx, x + 5, y + 25, 13, 2, '#f08c67');
    drawPixelRect(ctx, x + 23, y + 25, 11, 2, '#f08c67');
    return;
  }

  if (type === 'BUSH') {
    drawPixelRect(ctx, x + 3, y + size - 4, size - 6, 5, 'rgba(0,0,0,0.3)');
    drawPixelRect(ctx, x + 5, y + 4, size - 10, size - 8, '#123b18');
    drawPixelRect(ctx, x + 2, y + 8, size - 4, size - 14, '#123b18');
    drawPixelRect(ctx, x + 6, y + 6, size - 12, size - 11, '#246b2e');
    drawPixelRect(ctx, x + 4, y + 10, size - 8, size - 17, '#246b2e');
    drawPixelRect(ctx, x + 7, y + 7, 15, 10, '#3ca348');
    drawPixelRect(ctx, x + 24, y + 8, 15, 11, '#3ca348');
    drawPixelRect(ctx, x + 9, y + 18, 28, 12, '#338c3e');
    drawPixelRect(ctx, x + 9, y + 8, 9, 4, '#5cd669');
    drawPixelRect(ctx, x + 26, y + 9, 8, 4, '#5cd669');
    const blossoms = [
      { fx: 12, fy: 13 },
      { fx: 32, fy: 14 },
      { fx: 15, fy: 29 },
      { fx: 33, fy: 30 },
      { fx: 23, fy: 20 },
    ];
    blossoms.forEach(({ fx, fy }) => {
      drawPixelRect(ctx, x + fx - 2, y + fy, 6, 2, '#ffffff');
      drawPixelRect(ctx, x + fx, y + fy - 2, 2, 6, '#ffffff');
      drawPixelRect(ctx, x + fx, y + fy, 2, 2, '#facc15');
    });
    return;
  }

  if (type === 'CHEST') {
    const bob = Math.sin(time * 4) * 1;
    drawPixelRect(ctx, x + 4, y + size - 5, size - 8, 5, 'rgba(0,0,0,0.4)');
    drawPixelRect(ctx, x + 5, y + 9 + bob, size - 10, size - 13, '#241004');
    drawPixelRect(ctx, x + 7, y + 11 + bob, size - 14, size - 17, '#b85014');
    drawPixelRect(ctx, x + 7, y + 11 + bob, size - 14, 9, '#e06d28');
    drawPixelRect(ctx, x + 9, y + 12 + bob, size - 18, 3, '#f59e0b');
    drawPixelRect(ctx, x + 8, y + 11 + bob, 4, size - 17, '#fbbf24');
    drawPixelRect(ctx, x + size - 12, y + 11 + bob, 4, size - 17, '#fbbf24');
    drawPixelRect(ctx, x + 5, y + 20 + bob, size - 10, 3, '#241004');
    drawPixelRect(ctx, x + size / 2 - 4, y + 17 + bob, 8, 9, '#fde047');
    drawPixelRect(ctx, x + size / 2 - 1, y + 20 + bob, 2, 4, '#241004');
  }
}

export function drawItemCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: ItemType,
  time: number
): void {
  const bob = Math.sin(time * 5.5) * 2;
  const bx = x + 4;
  const by = y + 4 + bob;
  const bs = size - 8;

  drawPixelRect(ctx, bx + 2, y + size - 4, bs - 4, 4, 'rgba(0,0,0,0.35)');
  const frameOuter =
    type === 'KICK_BOOT'
      ? '#34d399'
      : type === 'THROW_GLOVE'
        ? '#38bdf8'
        : type === 'BOMB_UP'
          ? '#f59e0b'
          : '#fef08a';
  const frameInner =
    type === 'KICK_BOOT'
      ? '#059669'
      : type === 'THROW_GLOVE'
        ? '#0284c7'
        : '#ca8a04';

  drawPixelRect(ctx, bx - 1, by - 1, bs + 2, bs + 2, '#0f172a');
  drawPixelRect(ctx, bx, by, bs, bs, frameOuter);
  drawPixelRect(ctx, bx + 2, by + 2, bs - 4, bs - 4, frameInner);
  drawPixelRect(ctx, bx + 3, by + 3, bs - 6, bs - 6, '#1e293b');

  const cx = bx + bs / 2;
  const cy = by + bs / 2;

  if (type === 'BOMB_UP') {
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(cx - 1, cy + 1, 9, 0, Math.PI * 2);
    ctx.fill();
    drawPixelRect(ctx, cx - 5, cy - 3, 3, 3, '#e2e8f0');
    drawPixelRect(ctx, cx + 1, cy - 10, 3, 4, '#f59e0b');
    drawPixelRect(ctx, cx + 3, cy - 13, 4, 4, '#ef4444');
  } else if (type === 'FIRE_UP') {
    drawPixelRect(ctx, cx - 8, cy - 2, 16, 11, '#ea580c');
    drawPixelRect(ctx, cx - 6, cy - 8, 12, 15, '#f97316');
    drawPixelRect(ctx, cx - 3, cy - 12, 6, 7, '#f97316');
    drawPixelRect(ctx, cx - 4, cy - 3, 8, 10, '#facc15');
    drawPixelRect(ctx, cx - 2, cy + 1, 4, 5, '#fef9c3');
  } else if (type === 'SPEED_UP') {
    drawPixelRect(ctx, cx - 8, cy - 10, 10, 14, '#451a03');
    drawPixelRect(ctx, cx - 8, cy - 1, 16, 9, '#451a03');
    drawPixelRect(ctx, cx - 6, cy - 8, 7, 12, '#b45309');
    drawPixelRect(ctx, cx - 6, cy, 13, 6, '#d97706');
    drawPixelRect(ctx, cx - 6, cy - 6, 7, 2, '#fbbf24');
    drawPixelRect(ctx, cx - 8, cy + 5, 16, 3, '#78350f');
  } else if (type === 'HEART') {
    drawPixelRect(ctx, cx - 8, cy - 5, 7, 7, '#ef4444');
    drawPixelRect(ctx, cx + 1, cy - 5, 7, 7, '#ef4444');
    drawPixelRect(ctx, cx - 6, cy + 2, 12, 4, '#dc2626');
    drawPixelRect(ctx, cx - 3, cy + 6, 6, 3, '#b91c1c');
    drawPixelRect(ctx, cx - 6, cy - 3, 2, 2, '#fecaca');
  } else if (type === 'KICK_BOOT') {
    // Emerald Steel Kick Boot + Golden Impact Spark
    drawPixelRect(ctx, cx - 9, cy - 9, 9, 13, '#064e3b');
    drawPixelRect(ctx, cx - 9, cy, 16, 8, '#064e3b');
    drawPixelRect(ctx, cx - 7, cy - 7, 6, 11, '#10b981');
    drawPixelRect(ctx, cx - 7, cy + 1, 13, 5, '#34d399');
    drawPixelRect(ctx, cx - 9, cy + 5, 16, 3, '#fde047');
    // Impact spark at toe
    drawPixelRect(ctx, cx + 6, cy - 4, 4, 4, '#fde047');
    drawPixelRect(ctx, cx + 8, cy - 2, 3, 3, '#ffffff');
  } else if (type === 'THROW_GLOVE') {
    // Cyan Power Gauntlet / Boxing Glove + Trajectory Star
    drawPixelRect(ctx, cx - 8, cy - 6, 14, 12, '#0c4a6e');
    drawPixelRect(ctx, cx - 6, cy - 5, 11, 9, '#0284c7');
    drawPixelRect(ctx, cx - 5, cy - 4, 8, 6, '#38bdf8');
    drawPixelRect(ctx, cx - 7, cy + 3, 10, 4, '#f59e0b');
    // Arc star above glove
    drawPixelRect(ctx, cx + 3, cy - 10, 5, 5, '#fde047');
    drawPixelRect(ctx, cx + 4, cy - 9, 3, 3, '#ffffff');
  }
}

export function drawBombSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  timer: number,
  maxTimer: number,
  zHeight: number = 0
): void {
  const pulse = 1 + Math.sin((maxTimer - timer) * 15) * 0.08;
  const cx = x + size / 2;
  const cy = y + size / 2 + 3 - zHeight;
  const radius = 15.5 * pulse;

  // Ground shadow stays on ground while bomb soars in air!
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(cx, y + size - 5, Math.max(7, 14 - zHeight * 0.15), 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(cx - 2, cy - 2, radius * 0.72, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 5, 3.8, 0, Math.PI * 2);
  ctx.fill();

  drawPixelRect(ctx, cx - 3, cy - radius - 3, 6, 4, '#64748b');
  const spark = Math.floor(timer * 24) % 2 === 0;
  drawPixelRect(ctx, cx - 3, cy - radius - 10, 6, 7, spark ? '#f97316' : '#ef4444');
  drawPixelRect(ctx, cx - 1, cy - radius - 9, 3, 5, '#fef08a');
}

export function drawHeroSprite(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  _size: number,
  dir: Direction,
  animTime: number,
  isMoving: boolean,
  invulnerableTimer: number,
  skinId: HeroSkinId = 'KNIGHT_RED',
  badgeLabel?: string,
  kickTimer: number = 0,
  throwTimer: number = 0,
  isGhost: boolean = false,
  activeEmote?: string
): void {
  const bob = isGhost
    ? Math.sin(animTime * 6) * 4.5
    : isMoving
      ? Math.abs(Math.sin(animTime * 16)) * 3
      : Math.sin(animTime * 4) * 1;

  if (isGhost) {
    ctx.globalAlpha = 0.68 + Math.sin(animTime * 8) * 0.12;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(px, py + 15, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    drawMatrixSprite(
      ctx,
      'revenge_ghost_player',
      PHANTOM_MATRIX,
      PHANTOM_PALETTE,
      px,
      py - 4 - bob,
      2.2,
      dir === 'RIGHT'
    );
    ctx.globalAlpha = 1;

    const ghostTag = `👻 ${badgeLabel || 'MA'}`;
    ctx.font = '700 10px "Chakra Petch", "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    const gw = ctx.measureText(ghostTag).width + 10;
    drawPixelRect(ctx, px - gw / 2, py - 36 - bob, gw, 14, 'rgba(9, 15, 29, 0.85)');
    ctx.fillStyle = '#e9d5ff';
    ctx.fillText(ghostTag, px, py - 26 - bob);
  } else {
    if (invulnerableTimer > 0 && Math.floor(invulnerableTimer * 18) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    const useWalkFrame = isMoving && Math.floor(animTime * 10) % 2 === 1;
    const skin = HERO_SKINS[skinId] || HERO_SKINS.KNIGHT_RED;

    // Ground shadow + Active Timed Skill Aura Ring
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.beginPath();
    ctx.ellipse(px, py + 17, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (kickTimer > 0 || throwTimer > 0) {
      ctx.strokeStyle = throwTimer > 0 ? '#38bdf8' : '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(px, py + 17, 16 + Math.sin(animTime * 8) * 1.5, 6.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawMatrixSprite(
      ctx,
      `hero_${skin.id}_${useWalkFrame ? 'w1' : 'idle'}`,
      useWalkFrame ? HERO_WALK1_MATRIX : HERO_IDLE_MATRIX,
      skin.palette,
      px,
      py - 2 - bob,
      2.2,
      dir === 'LEFT'
    );

    ctx.globalAlpha = 1;

    // Active Timed Buff Countdown Tag or Player Name Pill above head
    if (kickTimer > 0 || throwTimer > 0) {
      const buffParts: string[] = [];
      if (kickTimer > 0) buffParts.push(`👟${Math.ceil(kickTimer)}s`);
      if (throwTimer > 0) buffParts.push(`🥊${Math.ceil(throwTimer)}s`);
      const text = buffParts.join(' ');
      ctx.font = '700 10px "Chakra Petch", "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      const tw = ctx.measureText(text).width + 10;
      drawPixelRect(ctx, px - tw / 2, py - 36 - bob, tw, 14, 'rgba(9, 15, 29, 0.88)');
      ctx.fillStyle = throwTimer > 0 ? '#7dd3fc' : '#6ee7b7';
      ctx.fillText(text, px, py - 26 - bob);
    } else if (badgeLabel) {
      ctx.font = '700 10px "Chakra Petch", "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      const tw = ctx.measureText(badgeLabel).width + 10;
      drawPixelRect(ctx, px - tw / 2, py - 36 - bob, tw, 14, 'rgba(9, 15, 29, 0.82)');
      ctx.fillStyle =
        badgeLabel.startsWith('P2')
          ? '#38bdf8'
          : badgeLabel.startsWith('P3')
            ? '#4ade80'
            : badgeLabel.startsWith('P4')
              ? '#f472b6'
              : '#fde047';
      ctx.fillText(badgeLabel, px, py - 26 - bob);
    }
  }

  // Pixel Speech Bubble Emote above head
  if (activeEmote) {
    const ey = py - 42 - bob;
    drawPixelRect(ctx, px - 13, ey - 11, 26, 20, '#0f172a');
    drawPixelRect(ctx, px - 11, ey - 9, 22, 16, '#ffffff');
    drawPixelRect(ctx, px - 3, ey + 7, 6, 4, '#ffffff');
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(activeEmote, px, ey + 4);
  }
}

export function drawEnemySprite(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  enemy: EnemyEntity
): void {
  const bounce = Math.abs(Math.sin(enemy.animTime * 7.5)) * 4;
  const cy = py - bounce;

  ctx.fillStyle = 'rgba(0,0,0,0.34)';
  ctx.beginPath();
  ctx.ellipse(px, py + 16, enemy.type === 'BOSS_KING' ? 20 : 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (enemy.hurtTimer > 0 && Math.floor(enemy.hurtTimer * 20) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  } else if (enemy.type === 'PHANTOM') {
    ctx.globalAlpha = 0.82;
  }

  if (enemy.type === 'SLIME') {
    drawMatrixSprite(ctx, 'slime_blue', SLIME_MATRIX, SLIME_PALETTE, px, cy, 2.2, enemy.dir === 'RIGHT');
  } else if (enemy.type === 'MAGMA_SLIME') {
    drawMatrixSprite(ctx, 'slime_magma', SLIME_MATRIX, MAGMA_SLIME_PALETTE, px, cy, 2.2, enemy.dir === 'RIGHT');
  } else if (enemy.type === 'SKELETON') {
    drawMatrixSprite(ctx, 'skeleton', SKELETON_MATRIX, SKELETON_PALETTE, px, cy - 2, 2.2, enemy.dir === 'RIGHT');
  } else if (enemy.type === 'PHANTOM') {
    drawMatrixSprite(ctx, 'phantom', PHANTOM_MATRIX, PHANTOM_PALETTE, px, cy - 3, 2.3, enemy.dir === 'RIGHT');
  } else if (enemy.type === 'BOSS_KING') {
    drawMatrixSprite(ctx, 'boss_king', BOSS_KING_MATRIX, BOSS_KING_PALETTE, px, cy - 6, 2.8, enemy.dir === 'RIGHT');
  }

  ctx.globalAlpha = 1;

  if (enemy.maxHp > 1) {
    const barW = enemy.type === 'BOSS_KING' ? 48 : 30;
    const barH = 5;
    const bx = px - barW / 2;
    const by = cy - (enemy.type === 'BOSS_KING' ? 34 : 26);
    drawPixelRect(ctx, bx - 1, by - 1, barW + 2, barH + 2, '#090d16');
    drawPixelRect(ctx, bx, by, barW, barH, '#334155');
    const fillW = Math.max(0, (enemy.hp / enemy.maxHp) * barW);
    drawPixelRect(ctx, bx, by, fillW, barH, enemy.type === 'BOSS_KING' ? '#f59e0b' : '#ef4444');
  }
}
