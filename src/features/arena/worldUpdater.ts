import {
  BOMB_SLIDE_SPEED,
  GRID_COLS,
  GRID_ROWS,
  SCORE_VALUES,
  SUDDEN_DEATH_START_SEC,
} from '../../constants/gameConstants';
import { Direction, PlayerState } from '../../types/gameTypes';
import { getSpikePhase } from '../../utils/pixelSprites';
import { soundEngine } from '../../utils/soundEngine';
import {
  addFloatingText,
  collectGroundItem,
  damagePlayer,
  detonateBomb,
  GameWorld,
  getAllHeroes,
  getPlayerSpeed,
  isTileWalkable,
  placePlayerBomb,
  spawnTileDebris,
} from './gameEngine';

export interface StepResult {
  event: 'NONE' | 'VICTORY' | 'GAME_OVER';
}

const DIR_VECTORS: Record<Direction, { dx: number; dy: number }> = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
};

// Precompute spiral coordinates from outer border inward for Sudden Death Falling Stones
const SPIRAL_COORDS: { col: number; row: number }[] = (() => {
  const coords: { col: number; row: number }[] = [];
  let top = 0;
  let bottom = GRID_ROWS - 1;
  let left = 0;
  let right = GRID_COLS - 1;

  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) coords.push({ col: c, row: top });
    top++;
    for (let r = top; r <= bottom; r++) coords.push({ col: right, row: r });
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) coords.push({ col: c, row: bottom });
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) coords.push({ col: left, row: r });
      left++;
    }
  }
  return coords;
})();

function isCellInBlastDanger(world: GameWorld, col: number, row: number): boolean {
  if (world.flames.some((fl) => fl.col === col && fl.row === row)) return true;
  if (world.fallingWarnings.some((w) => w.col === col && w.row === row)) return true;
  return world.bombs.some((b) => {
    if (b.isAirborne) return false;
    const bc = Math.round(b.x);
    const br = Math.round(b.y);
    if (bc === col && Math.abs(br - row) <= b.range) return true;
    if (br === row && Math.abs(bc - col) <= b.range) return true;
    return false;
  });
}

function computeAiHeroDirection(world: GameWorld, bot: PlayerState, dt: number): Direction | null {
  bot.aiDecisionTimer = (bot.aiDecisionTimer ?? 0) - dt;
  const bCol = Math.round(bot.x);
  const bRow = Math.round(bot.y);
  const allDirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

  if (bot.isGhost) {
    if (bot.aiDecisionTimer <= 0) {
      bot.aiDecisionTimer = 0.5 + Math.random() * 0.5;
      const target = world.player;
      if (Math.abs(target.x - bot.x) > Math.abs(target.y - bot.y)) {
        bot.dir = target.x > bot.x ? 'RIGHT' : 'LEFT';
      } else {
        bot.dir = target.y > bot.y ? 'DOWN' : 'UP';
      }
      if (bot.ghostBombCooldown <= 0 && Math.hypot(target.x - bot.x, target.y - bot.y) < 2.2) {
        placePlayerBomb(world, bot);
      }
    }
    return bot.dir;
  }

  const inDanger = isCellInBlastDanger(world, bCol, bRow);

  if (inDanger || bot.aiDecisionTimer <= 0) {
    bot.aiDecisionTimer = inDanger ? 0.16 : 0.35 + Math.random() * 0.35;

    const safeDirs = allDirs.filter((d) => {
      const v = DIR_VECTORS[d];
      const nc = bCol + v.dx;
      const nr = bRow + v.dy;
      return isTileWalkable(world, nc, nr) && !isCellInBlastDanger(world, nc, nr);
    });

    if (safeDirs.length > 0) {
      bot.dir = safeDirs[Math.floor(Math.random() * safeDirs.length)];
    } else {
      const anyWalkable = allDirs.filter((d) => {
        const v = DIR_VECTORS[d];
        return isTileWalkable(world, bCol + v.dx, bRow + v.dy);
      });
      if (anyWalkable.length > 0) {
        bot.dir = anyWalkable[Math.floor(Math.random() * anyWalkable.length)];
      }
    }

    // Place bomb if safe and next to brick/chest or near a rival player
    if (!inDanger && Math.random() < 0.32) {
      const hasAdjacentBrick = allDirs.some((d) => {
        const v = DIR_VECTORS[d];
        const t = world.grid[bRow + v.dy]?.[bCol + v.dx];
        return t === 'BRICK' || t === 'BUSH' || t === 'CHEST';
      });
      const nearRival = Math.hypot(world.player.x - bot.x, world.player.y - bot.y) <= 2.5;
      if ((hasAdjacentBrick || nearRival) && safeDirs.length >= 1) {
        placePlayerBomb(world, bot);
      }
    }
  }

  return bot.dir;
}

function updateSingleHero(
  world: GameWorld,
  p: PlayerState,
  dt: number,
  activeDir: Direction | null
): 'NONE' | 'VICTORY' | 'ALL_DEAD' {
  if (p.emoteTimer > 0) {
    p.emoteTimer = Math.max(0, p.emoteTimer - dt);
    if (p.emoteTimer === 0) {
      p.activeEmote = undefined;
    }
  }

  if (p.ghostBombCooldown > 0) {
    p.ghostBombCooldown = Math.max(0, p.ghostBombCooldown - dt);
  }

  // Revenge Ghost Mode: Dead player in 2P/Multi/Battle floats across arena
  if (!p.isAlive) {
    if (!p.isGhost) return 'NONE';
    p.animTime += dt;
    if (activeDir) {
      p.dir = activeDir;
      p.isMoving = true;
      const speed = getPlayerSpeed(p);
      const { dx, dy } = DIR_VECTORS[activeDir];
      p.x = Math.max(0, Math.min(GRID_COLS - 1, p.x + dx * speed * dt));
      p.y = Math.max(0, Math.min(GRID_ROWS - 1, p.y + dy * speed * dt));
    } else {
      p.isMoving = false;
    }
    return 'NONE';
  }

  if (p.invulnerableTimer > 0) p.invulnerableTimer = Math.max(0, p.invulnerableTimer - dt);
  if (p.teleportCooldown > 0) p.teleportCooldown = Math.max(0, p.teleportCooldown - dt);

  if (p.kickTimer > 0) {
    p.kickTimer = Math.max(0, p.kickTimer - dt);
    if (p.kickTimer === 0) {
      addFloatingText(world, p.x, p.y, 'HẾT GIỜ ĐÁ BOM! 👟', '#94a3b8');
    }
  }

  if (p.throwTimer > 0) {
    p.throwTimer = Math.max(0, p.throwTimer - dt);
    if (p.throwTimer === 0) {
      addFloatingText(world, p.x, p.y, 'HẾT GIỜ NÉM BOM! 🥊', '#94a3b8');
    }
  }

  const currentTileCol = Math.round(p.x);
  const currentTileRow = Math.round(p.y);
  const standingBomb = world.bombs.find(
    (b) =>
      !b.isAirborne &&
      Math.round(b.x) === currentTileCol &&
      Math.round(b.y) === currentTileRow &&
      b.ownerCanPass
  );

  if (activeDir) {
    p.dir = activeDir;
    p.isMoving = true;
    p.animTime += dt;

    const speed = getPlayerSpeed(p);
    const { dx, dy } = DIR_VECTORS[activeDir];
    const step = speed * dt;
    const nextTileCol = currentTileCol + dx;
    const nextTileRow = currentTileRow + dy;

    if (p.kickTimer > 0) {
      const blockingBomb = world.bombs.find(
        (b) =>
          !b.isAirborne &&
          !b.ownerCanPass &&
          b.vx === 0 &&
          b.vy === 0 &&
          Math.round(b.x) === nextTileCol &&
          Math.round(b.y) === nextTileRow
      );

      if (blockingBomb && isTileWalkable(world, nextTileCol + dx, nextTileRow + dy)) {
        blockingBomb.vx = dx * BOMB_SLIDE_SPEED;
        blockingBomb.vy = dy * BOMB_SLIDE_SPEED;
        soundEngine.playPlaceBomb();
        addFloatingText(
          world,
          nextTileCol,
          nextTileRow,
          `ĐÁ! (${Math.ceil(p.kickTimer)}s) 👟`,
          '#34d399'
        );
      }
    }

    if (dx !== 0) {
      const alignedRow = Math.round(p.y);
      const movingTowardCenter =
        (dx > 0 && p.x < currentTileCol) || (dx < 0 && p.x > currentTileCol);
      const canEnterNext = isTileWalkable(world, currentTileCol + dx, alignedRow, standingBomb);

      if (movingTowardCenter || canEnterNext) {
        let nextX = p.x + dx * step;
        if (!canEnterNext) {
          nextX = dx > 0 ? Math.min(nextX, currentTileCol) : Math.max(nextX, currentTileCol);
        }
        p.x = nextX;
        const diffY = alignedRow - p.y;
        p.y += Math.sign(diffY) * Math.min(Math.abs(diffY), step * 1.65);
      } else {
        p.x = currentTileCol;
        const offsetY = p.y - alignedRow;
        if (Math.abs(offsetY) > 0.06) {
          const altRow = offsetY > 0 ? alignedRow + 1 : alignedRow - 1;
          if (
            isTileWalkable(world, currentTileCol, altRow, standingBomb) &&
            isTileWalkable(world, currentTileCol + dx, altRow, standingBomb)
          ) {
            const diffAlt = altRow - p.y;
            p.y += Math.sign(diffAlt) * Math.min(Math.abs(diffAlt), step * 1.35);
          }
        }
      }
    } else if (dy !== 0) {
      const alignedCol = Math.round(p.x);
      const movingTowardCenter =
        (dy > 0 && p.y < currentTileRow) || (dy < 0 && p.y > currentTileRow);
      const canEnterNext = isTileWalkable(world, alignedCol, currentTileRow + dy, standingBomb);

      if (movingTowardCenter || canEnterNext) {
        let nextY = p.y + dy * step;
        if (!canEnterNext) {
          nextY = dy > 0 ? Math.min(nextY, currentTileRow) : Math.max(nextY, currentTileRow);
        }
        p.y = nextY;
        const diffX = alignedCol - p.x;
        p.x += Math.sign(diffX) * Math.min(Math.abs(diffX), step * 1.65);
      } else {
        p.y = currentTileRow;
        const offsetX = p.x - alignedCol;
        if (Math.abs(offsetX) > 0.06) {
          const altCol = offsetX > 0 ? alignedCol + 1 : alignedCol - 1;
          if (
            isTileWalkable(world, altCol, currentTileRow, standingBomb) &&
            isTileWalkable(world, altCol, currentTileRow + dy, standingBomb)
          ) {
            const diffAlt = altCol - p.x;
            p.x += Math.sign(diffAlt) * Math.min(Math.abs(diffAlt), step * 1.35);
          }
        }
      }
    }
  } else {
    p.isMoving = false;
    p.animTime += dt;
  }

  const pCol = Math.round(p.x);
  const pRow = Math.round(p.y);

  // Open Treasure Chest (grants +500 pts, +25 Coins & guaranteed 14s Kick or Throw skill!)
  if (world.grid[pRow]?.[pCol] === 'CHEST') {
    world.grid[pRow][pCol] = 'EMPTY';
    world.score += SCORE_VALUES.CHEST_OPEN;
    world.coinsEarned += 25;
    soundEngine.playChestOpen();
    spawnTileDebris(world, pCol, pRow, 'SPARKLE');
    if ((pCol + pRow) % 2 === 0) {
      p.kickTimer = Math.min(25, p.kickTimer + 14);
      addFloatingText(world, pCol, pRow, '+25 XU & ĐÁ BOM 14s! 👟', '#34d399');
    } else {
      p.throwTimer = Math.min(25, p.throwTimer + 14);
      addFloatingText(world, pCol, pRow, '+25 XU & NÉM BOM 14s! 🥊', '#38bdf8');
    }
  }

  // Teleport Portal Check
  if (p.teleportCooldown <= 0 && world.level.teleporters) {
    for (const tp of world.level.teleporters) {
      if (Math.hypot(p.x - tp.colA, p.y - tp.rowA) < 0.42) {
        p.x = tp.colB;
        p.y = tp.rowB;
        p.teleportCooldown = 1.1;
        soundEngine.playTeleport();
        spawnTileDebris(world, tp.colB, tp.rowB, 'SPARKLE');
        addFloatingText(world, tp.colB, tp.rowB, 'WARP! ⚡', '#38bdf8');
        break;
      } else if (Math.hypot(p.x - tp.colB, p.y - tp.rowB) < 0.42) {
        p.x = tp.colA;
        p.y = tp.rowA;
        p.teleportCooldown = 1.1;
        soundEngine.playTeleport();
        spawnTileDebris(world, tp.colA, tp.rowA, 'SPARKLE');
        addFloatingText(world, tp.colA, tp.rowA, 'WARP! ⚡', '#38bdf8');
        break;
      }
    }
  }

  // Spike Trap Check
  if (world.level.spikes) {
    for (const trap of world.level.spikes) {
      if (
        getSpikePhase(world.elapsedTime, trap.offset) === 'ACTIVE' &&
        Math.hypot(p.x - trap.col, p.y - trap.row) < 0.48
      ) {
        const dmgRes = damagePlayer(world, p);
        if (dmgRes === 'ALL_DEAD') return 'ALL_DEAD';
        if (dmgRes === 'BATTLE_VICTORY') return 'VICTORY';
      }
    }
  }

  // Ground Item Pickup
  for (let i = world.groundItems.length - 1; i >= 0; i--) {
    const item = world.groundItems[i];
    if (Math.hypot(p.x - item.col, p.y - item.row) < 0.55) {
      collectGroundItem(world, item, p);
      world.groundItems.splice(i, 1);
    }
  }

  // Exit Portal Check (Only for human players when all monsters defeated)
  if (!p.isAiBot) {
    const distToExit = Math.hypot(p.x - world.level.exitPos.col, p.y - world.level.exitPos.row);
    if (distToExit < 0.55 || (pCol === world.level.exitPos.col && pRow === 0)) {
      if (world.enemies.length === 0) {
        return 'VICTORY';
      } else if (Math.floor(world.elapsedTime * 2) % 2 === 0 && world.floatingTexts.length < 3) {
        addFloatingText(
          world,
          world.level.exitPos.col,
          world.level.exitPos.row,
          `CÒN ${world.enemies.length} QUÁI! 🔒`,
          '#f87171'
        );
      }
    }
  }

  return 'NONE';
}

export function stepGameWorld(
  world: GameWorld,
  dt: number,
  activeDirP1: Direction | null,
  activeDirP2: Direction | null = null
): StepResult {
  world.elapsedTime += dt;
  world.timeRemaining = Math.max(0, world.timeRemaining - dt);
  if (world.timeRemaining <= 0) {
    soundEngine.playGameOver();
    return { event: 'GAME_OVER' };
  }

  if (world.screenShake > 0) {
    world.screenShake = Math.max(0, world.screenShake - dt);
  }

  const activeHeroes = getAllHeroes(world);

  // 1. Sudden Death Falling Stones (Vòng Bo Tử Thần in final 45 seconds!)
  if (world.timeRemaining <= SUDDEN_DEATH_START_SEC) {
    if (!world.suddenDeathAnnounced) {
      world.suddenDeathAnnounced = true;
      world.screenShake = 0.4;
      addFloatingText(
        world,
        Math.floor(GRID_COLS / 2),
        Math.floor(GRID_ROWS / 2),
        '⚠️ VÒNG BO ĐÁ RƠI TỬ THẦN! ⚠️',
        '#ef4444'
      );
    }

    world.suddenDeathTickTimer -= dt;
    if (world.suddenDeathTickTimer <= 0 && world.suddenDeathSpiralIndex < SPIRAL_COORDS.length - 15) {
      world.suddenDeathTickTimer = 1.15;
      while (world.suddenDeathSpiralIndex < SPIRAL_COORDS.length - 15) {
        const target = SPIRAL_COORDS[world.suddenDeathSpiralIndex++];
        if (
          target.col === world.level.exitPos.col &&
          target.row === world.level.exitPos.row
        ) {
          continue;
        }
        if (world.grid[target.row]?.[target.col] !== 'STONE') {
          world.fallingWarnings.push({
            col: target.col,
            row: target.row,
            timer: 1.35,
          });
          break;
        }
      }
    }

    for (let i = world.fallingWarnings.length - 1; i >= 0; i--) {
      const w = world.fallingWarnings[i];
      w.timer -= dt;
      if (w.timer <= 0) {
        world.fallingWarnings.splice(i, 1);
        if (world.grid[w.row]?.[w.col] !== undefined && world.grid[w.row][w.col] !== 'EXIT') {
          world.grid[w.row][w.col] = 'STONE';
          world.screenShake = Math.max(world.screenShake, 0.18);
          spawnTileDebris(world, w.col, w.row, 'BRICK');

          for (const h of activeHeroes) {
            if (h.isAlive && Math.hypot(h.x - w.col, h.y - w.row) < 0.65) {
              const dmgRes = damagePlayer(world, h);
              if (dmgRes === 'ALL_DEAD') {
                soundEngine.playGameOver();
                return { event: 'GAME_OVER' };
              }
              if (dmgRes === 'BATTLE_VICTORY') {
                world.coinsEarned += 100;
                soundEngine.playVictory();
                return { event: 'VICTORY' };
              }
            }
          }
        }
      }
    }
  }

  // Update P1
  const resP1 = updateSingleHero(world, world.player, dt, activeDirP1);
  if (resP1 === 'ALL_DEAD') {
    soundEngine.playGameOver();
    return { event: 'GAME_OVER' };
  }
  if (resP1 === 'VICTORY') {
    world.score +=
      SCORE_VALUES.LEVEL_CLEAR_BASE +
      Math.floor(world.timeRemaining) * SCORE_VALUES.TIME_BONUS_PER_SEC;
    world.coinsEarned += 80;
    soundEngine.playVictory();
    return { event: 'VICTORY' };
  }

  // Update P2 (Human 2P or AI Bot in Battle Royale)
  if (world.player2) {
    const dirP2 = world.player2.isAiBot
      ? computeAiHeroDirection(world, world.player2, dt)
      : activeDirP2;
    const resP2 = updateSingleHero(world, world.player2, dt, dirP2);
    if (resP2 === 'ALL_DEAD') {
      soundEngine.playGameOver();
      return { event: 'GAME_OVER' };
    }
    if (resP2 === 'VICTORY') {
      world.score +=
        SCORE_VALUES.LEVEL_CLEAR_BASE +
        Math.floor(world.timeRemaining) * SCORE_VALUES.TIME_BONUS_PER_SEC;
      world.coinsEarned += 80;
      soundEngine.playVictory();
      return { event: 'VICTORY' };
    }
  }

  // Update Extra Players (P3, P4 in 4P Battle Royale / Online Room)
  for (const ep of world.extraPlayers) {
    const dirEp = ep.isAiBot ? computeAiHeroDirection(world, ep, dt) : null;
    const resEp = updateSingleHero(world, ep, dt, dirEp);
    if (resEp === 'ALL_DEAD') {
      soundEngine.playGameOver();
      return { event: 'GAME_OVER' };
    }
    if (resEp === 'VICTORY') {
      world.coinsEarned += 100;
      soundEngine.playVictory();
      return { event: 'VICTORY' };
    }
  }

  // Solidify bombs once all living players step off
  world.bombs.forEach((b) => {
    if (b.ownerCanPass) {
      const anyoneOnBomb = activeHeroes.some(
        (h) => h.isAlive && Math.hypot(h.x - b.x, h.y - b.y) <= 0.78
      );
      if (!anyoneOnBomb) b.ownerCanPass = false;
    }
  });

  // Update Ground Items immunity
  world.groundItems.forEach((item) => {
    if (item.immunityTimer > 0) item.immunityTimer = Math.max(0, item.immunityTimer - dt);
  });

  // 2. Update Bombs (Airborne Throw Arc, Kick Sliding, Portal Warp, Detonation)
  for (let i = world.bombs.length - 1; i >= 0; i--) {
    const b = world.bombs[i];
    if (b.teleportCooldown && b.teleportCooldown > 0) {
      b.teleportCooldown = Math.max(0, b.teleportCooldown - dt);
    }

    if (b.isAirborne) {
      b.throwProgress = Math.min(1, (b.throwProgress || 0) + dt * 2.4);
      const prog = b.throwProgress;
      b.x =
        (b.throwStartX ?? b.x) + ((b.throwTargetCol ?? b.col) - (b.throwStartX ?? b.x)) * prog;
      b.y =
        (b.throwStartY ?? b.y) + ((b.throwTargetRow ?? b.row) - (b.throwStartY ?? b.y)) * prog;
      b.zHeight = Math.sin(prog * Math.PI) * 38;

      if (prog >= 1) {
        b.isAirborne = false;
        b.zHeight = 0;
        b.x = b.throwTargetCol ?? Math.round(b.x);
        b.y = b.throwTargetRow ?? Math.round(b.y);
        b.col = b.x;
        b.row = b.y;
        soundEngine.playPlaceBomb();
      }
      continue;
    }

    if (b.vx !== 0 || b.vy !== 0) {
      const nextX = b.x + b.vx * dt;
      const nextY = b.y + b.vy * dt;
      const checkCol = Math.round(b.x + Math.sign(b.vx) * 0.48);
      const checkRow = Math.round(b.y + Math.sign(b.vy) * 0.48);
      const hitEnemy = world.enemies.some((e) => Math.hypot(e.x - nextX, e.y - nextY) < 0.65);

      if (
        !hitEnemy &&
        isTileWalkable(world, checkCol, checkRow, {
          col: Math.round(b.x),
          row: Math.round(b.y),
        })
      ) {
        b.x = nextX;
        b.y = nextY;
        b.col = Math.round(b.x);
        b.row = Math.round(b.y);
      } else {
        b.vx = 0;
        b.vy = 0;
        b.x = Math.round(b.x);
        b.y = Math.round(b.y);
        b.col = b.x;
        b.row = b.y;
      }
    }

    // Bomb Teleportation
    if ((!b.teleportCooldown || b.teleportCooldown <= 0) && world.level.teleporters) {
      for (const tp of world.level.teleporters) {
        if (Math.hypot(b.x - tp.colA, b.y - tp.rowA) < 0.35) {
          b.x = tp.colB;
          b.y = tp.rowB;
          b.col = tp.colB;
          b.row = tp.rowB;
          b.teleportCooldown = 1.2;
          soundEngine.playTeleport();
          break;
        } else if (Math.hypot(b.x - tp.colB, b.y - tp.rowB) < 0.35) {
          b.x = tp.colA;
          b.y = tp.rowA;
          b.col = tp.colA;
          b.row = tp.rowA;
          b.teleportCooldown = 1.2;
          soundEngine.playTeleport();
          break;
        }
      }
    }

    b.timer -= dt;
    if (b.timer <= 0) {
      world.bombs.splice(i, 1);
      if (b.isDemoSafe) {
        activeHeroes.forEach((h) => {
          h.invulnerableTimer = Math.max(h.invulnerableTimer, 0.9);
        });
      }
      detonateBomb(world, b);
    }
  }

  // 3. Update Flames & Hits
  for (let i = world.flames.length - 1; i >= 0; i--) {
    const f = world.flames[i];
    f.timer -= dt;
    if (f.timer <= 0) {
      world.flames.splice(i, 1);
      continue;
    }

    for (const h of activeHeroes) {
      if (h.isAlive && Math.hypot(h.x - f.col, h.y - f.row) < 0.56) {
        const dmgRes = damagePlayer(world, h);
        if (dmgRes === 'ALL_DEAD') {
          soundEngine.playGameOver();
          return { event: 'GAME_OVER' };
        }
        if (dmgRes === 'BATTLE_VICTORY') {
          world.coinsEarned += 100;
          soundEngine.playVictory();
          return { event: 'VICTORY' };
        }
      }
    }

    for (let j = world.enemies.length - 1; j >= 0; j--) {
      const e = world.enemies[j];
      if (e.hurtTimer <= 0 && Math.hypot(e.x - f.col, e.y - f.row) < 0.68) {
        e.hp -= 1;
        e.hurtTimer = 0.85;
        if (e.hp <= 0) {
          const pts =
            e.type === 'BOSS_KING'
              ? SCORE_VALUES.BOSS_KILL
              : e.type === 'MAGMA_SLIME'
                ? SCORE_VALUES.MAGMA_KILL
                : e.type === 'PHANTOM'
                  ? SCORE_VALUES.PHANTOM_KILL
                  : e.type === 'SKELETON'
                    ? SCORE_VALUES.SKELETON_KILL
                    : SCORE_VALUES.SLIME_KILL;
          world.score += pts;
          world.coinsEarned += e.type === 'BOSS_KING' ? 120 : 15;
          soundEngine.playEnemyDefeat();
          spawnTileDebris(world, e.x, e.y, 'SPARKLE');
          addFloatingText(world, e.x, e.y, `+${pts}`, '#38bdf8');
          world.enemies.splice(j, 1);
        } else {
          soundEngine.playEnemyDefeat();
          addFloatingText(world, e.x, e.y, `HP: ${e.hp}/${e.maxHp}`, '#fbbf24');
          if (e.type === 'BOSS_KING') {
            e.speed += 0.2;
            world.enemies.push({
              id: `minion-${Date.now()}`,
              type: 'SLIME',
              x: Math.round(e.x),
              y: Math.round(e.y),
              dir: 'LEFT',
              speed: 1.5,
              hp: 1,
              maxHp: 1,
              animTime: 0,
              aiTimer: 0.4,
              hurtTimer: 0.9,
              isChasing: false,
              canPassSoftWalls: false,
            });
          }
        }
      }
    }
  }

  // 4. Update Enemy AI
  const allDirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

  for (let i = world.enemies.length - 1; i >= 0; i--) {
    const e = world.enemies[i];
    e.animTime += dt;
    e.aiTimer -= dt;
    if (e.hurtTimer > 0) e.hurtTimer = Math.max(0, e.hurtTimer - dt);

    if (!e.canPassSoftWalls && e.hurtTimer <= 0 && world.level.spikes) {
      const hitSpike = world.level.spikes.some(
        (trap) =>
          getSpikePhase(world.elapsedTime, trap.offset) === 'ACTIVE' &&
          Math.hypot(e.x - trap.col, e.y - trap.row) < 0.45
      );
      if (hitSpike && e.type !== 'BOSS_KING') {
        e.hp -= 1;
        e.hurtTimer = 0.9;
        if (e.hp <= 0) {
          world.score += 150;
          world.coinsEarned += 10;
          soundEngine.playSpikeTrap();
          spawnTileDebris(world, e.x, e.y, 'SPARKLE');
          addFloatingText(world, e.x, e.y, '+150 TRAP!', '#f87171');
          world.enemies.splice(i, 1);
          continue;
        }
      }
    }

    const ecol = Math.round(e.x);
    const erow = Math.round(e.y);

    let targetHero = world.player;
    for (const h of activeHeroes) {
      if (
        h.isAlive &&
        (!targetHero.isAlive ||
          Math.hypot(h.x - e.x, h.y - e.y) < Math.hypot(targetHero.x - e.x, targetHero.y - e.y))
      ) {
        targetHero = h;
      }
    }
    const pCol = Math.round(targetHero.x);
    const pRow = Math.round(targetHero.y);

    if (e.type !== 'SLIME' && e.aiTimer <= 0) {
      const aggroRange = e.type === 'BOSS_KING' ? 9 : 7;
      if (ecol === pCol && Math.abs(erow - pRow) <= aggroRange) {
        const nextR = erow + (pRow > erow ? 1 : -1);
        if (!isCellInBlastDanger(world, ecol, nextR)) {
          e.dir = pRow > erow ? 'DOWN' : 'UP';
          e.isChasing = true;
        }
      } else if (erow === pRow && Math.abs(ecol - pCol) <= aggroRange) {
        const nextC = ecol + (pCol > ecol ? 1 : -1);
        if (!isCellInBlastDanger(world, nextC, erow)) {
          e.dir = pCol > ecol ? 'RIGHT' : 'LEFT';
          e.isChasing = true;
        }
      } else {
        e.isChasing = false;
      }
    }

    const { dx, dy } = DIR_VECTORS[e.dir];
    const targetCol = ecol + dx;
    const targetRow = erow + dy;

    const movingTowardCenter =
      (dx > 0 && e.x < ecol) ||
      (dx < 0 && e.x > ecol) ||
      (dy > 0 && e.y < erow) ||
      (dy > 0 && e.y > erow);

    const steppingIntoNewDanger =
      !isCellInBlastDanger(world, ecol, erow) &&
      isCellInBlastDanger(world, targetCol, targetRow) &&
      Math.random() < 0.82;

    const canEnterNext =
      !steppingIntoNewDanger &&
      isTileWalkable(world, targetCol, targetRow, undefined, e.canPassSoftWalls) &&
      world.grid[targetRow]?.[targetCol] !== 'CHEST' &&
      !world.flames.some((fl) => fl.col === targetCol && fl.row === targetRow);

    if (movingTowardCenter || canEnterNext) {
      let nextX = e.x + dx * e.speed * dt;
      let nextY = e.y + dy * e.speed * dt;
      if (!canEnterNext) {
        if (dx !== 0) nextX = dx > 0 ? Math.min(nextX, ecol) : Math.max(nextX, ecol);
        if (dy !== 0) nextY = dy > 0 ? Math.min(nextY, erow) : Math.max(nextY, erow);
      }
      e.x = nextX;
      e.y = nextY;
      if (dx !== 0) e.y += (erow - e.y) * 6 * dt;
      if (dy !== 0) e.x += (ecol - e.x) * 6 * dt;

      if (e.aiTimer <= 0 && Math.hypot(e.x - ecol, e.y - erow) < 0.09) {
        e.aiTimer = 0.45 + Math.random() * 0.55;
        if (Math.random() < 0.35 || isCellInBlastDanger(world, ecol, erow)) {
          const safeDirs = allDirs.filter((d) => {
            const v = DIR_VECTORS[d];
            return (
              isTileWalkable(world, ecol + v.dx, erow + v.dy, undefined, e.canPassSoftWalls) &&
              !isCellInBlastDanger(world, ecol + v.dx, erow + v.dy)
            );
          });
          const validDirs =
            safeDirs.length > 0
              ? safeDirs
              : allDirs.filter((d) => {
                  const v = DIR_VECTORS[d];
                  return isTileWalkable(
                    world,
                    ecol + v.dx,
                    erow + v.dy,
                    undefined,
                    e.canPassSoftWalls
                  );
                });
          if (validDirs.length > 0) e.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
        }
      }
    } else {
      e.x = ecol;
      e.y = erow;
      const safeDirs = allDirs.filter((d) => {
        const v = DIR_VECTORS[d];
        return (
          isTileWalkable(world, ecol + v.dx, erow + v.dy, undefined, e.canPassSoftWalls) &&
          !isCellInBlastDanger(world, ecol + v.dx, erow + v.dy)
        );
      });
      const validDirs =
        safeDirs.length > 0
          ? safeDirs
          : allDirs.filter((d) => {
              const v = DIR_VECTORS[d];
              return isTileWalkable(
                world,
                ecol + v.dx,
                erow + v.dy,
                undefined,
                e.canPassSoftWalls
              );
            });
      if (validDirs.length > 0) e.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
      e.aiTimer = 0.22;
    }

    for (const h of activeHeroes) {
      if (h.isAlive && Math.hypot(h.x - e.x, h.y - e.y) < 0.56) {
        const dmgRes = damagePlayer(world, h);
        if (dmgRes === 'ALL_DEAD') {
          soundEngine.playGameOver();
          return { event: 'GAME_OVER' };
        }
        if (dmgRes === 'BATTLE_VICTORY') {
          world.coinsEarned += 100;
          soundEngine.playVictory();
          return { event: 'VICTORY' };
        }
      }
    }
  }

  // 5. Particles & Floating Texts
  for (let i = world.particles.length - 1; i >= 0; i--) {
    const pt = world.particles[i];
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vy += pt.gravity * dt;
    pt.life -= dt;
    if (pt.life <= 0) world.particles.splice(i, 1);
  }

  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y -= 28 * dt;
    ft.life -= dt;
    if (ft.life <= 0) world.floatingTexts.splice(i, 1);
  }

  return { event: 'NONE' };
}
