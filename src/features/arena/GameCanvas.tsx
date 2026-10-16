import React, { useEffect, useRef } from 'react';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DIORAMA_PAD_LEFT,
  DIORAMA_PAD_TOP,
  GRID_COLS,
  GRID_ROWS,
  PIXEL_EMOTES,
  TILE_SIZE,
} from '../../constants/gameConstants';
import { Direction, GameStatus } from '../../types/gameTypes';
import {
  drawBombSprite,
  drawEnemySprite,
  drawHeroSprite,
  drawItemCard,
  drawSpikeTrapTile,
  drawTeleporterTile,
  drawTileObstacle,
} from '../../utils/pixelSprites';
import {
  drawDioramaEnvironment,
  drawFlameCross,
  drawParticles,
  drawSuddenDeathWarnings,
} from './dioramaRenderer';
import {
  GameWorld,
  getAllHeroes,
  placePlayerBomb,
  throwPlayerBomb,
  triggerPlayerEmote,
} from './gameEngine';
import { stepGameWorld } from './worldUpdater';

interface GameCanvasProps {
  worldRef: React.MutableRefObject<GameWorld>;
  status: GameStatus;
  touchDir: Direction | null;
  isMobileLandscape?: boolean;
  onSyncHud: () => void;
  onGameEnd: (result: 'VICTORY' | 'GAME_OVER') => void;
  onBroadcastEmote?: (emote: string) => void;
  onBroadcastPlayerSync?: (payload: {
    x: number;
    y: number;
    dir: Direction;
    isMoving: boolean;
    hp: number;
    isAlive: boolean;
    isGhost: boolean;
  }) => void;
  onBroadcastBombAction?: (payload: {
    action: 'PLACE' | 'THROW';
    x: number;
    y: number;
    dir: Direction;
  }) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  worldRef,
  status,
  touchDir,
  isMobileLandscape = false,
  onSyncHud,
  onGameEnd,
  onBroadcastEmote,
  onBroadcastPlayerSync,
  onBroadcastBombAction,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const p1KeysRef = useRef<Set<Direction>>(new Set());
  const p2KeysRef = useRef<Set<Direction>>(new Set());

  useEffect(() => {
    if (status !== 'PLAYING') {
      p1KeysRef.current.clear();
      p2KeysRef.current.clear();
    }

    const isTypingElement = (el: EventTarget | Element | null): boolean => {
      if (!el || !(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable
      );
    };

    const mapWasd = (code: string): Direction | null => {
      if (code === 'KeyW') return 'UP';
      if (code === 'KeyS') return 'DOWN';
      if (code === 'KeyA') return 'LEFT';
      if (code === 'KeyD') return 'RIGHT';
      return null;
    };

    const mapArrows = (code: string): Direction | null => {
      if (code === 'ArrowUp') return 'UP';
      if (code === 'ArrowDown') return 'DOWN';
      if (code === 'ArrowLeft') return 'LEFT';
      if (code === 'ArrowRight') return 'RIGHT';
      return null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingElement(e.target) || isTypingElement(document.activeElement)) {
        return;
      }
      if (status !== 'PLAYING') return;
      const world = worldRef.current;

      const wasdDir = mapWasd(e.code);
      const arrowDir = mapArrows(e.code);

      if (wasdDir) {
        e.preventDefault();
        p1KeysRef.current.add(wasdDir);
        return;
      }

      if (arrowDir) {
        e.preventDefault();
        if (world.isTwoPlayer && world.player2 && !world.player2.isAiBot) {
          p2KeysRef.current.add(arrowDir);
        } else {
          p1KeysRef.current.add(arrowDir);
        }
        return;
      }

      // Quick Pixel Emotes (Keys 1, 2, 3, 4)
      if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3' || e.code === 'Digit4') {
        const idx = Number(e.code.replace('Digit', '')) - 1;
        const emote = PIXEL_EMOTES[idx];
        if (emote) {
          triggerPlayerEmote(world, world.player, emote);
          onBroadcastEmote?.(emote);
        }
        return;
      }

      // P1 Place Bomb
      if (e.code === 'Space' || e.code === 'KeyJ') {
        e.preventDefault();
        placePlayerBomb(world, world.player);
        onBroadcastBombAction?.({
          action: 'PLACE',
          x: world.player.x,
          y: world.player.y,
          dir: world.player.dir,
        });
        return;
      }

      // P1 Throw Bomb (K or G)
      if (e.code === 'KeyK' || e.code === 'KeyG') {
        e.preventDefault();
        throwPlayerBomb(world, world.player);
        onBroadcastBombAction?.({
          action: 'THROW',
          x: world.player.x,
          y: world.player.y,
          dir: world.player.dir,
        });
        return;
      }

      // P2 or 1P Enter Place Bomb
      if (e.code === 'Enter' || e.code === 'Numpad0') {
        e.preventDefault();
        if (world.isTwoPlayer && world.player2 && !world.player2.isAiBot) {
          placePlayerBomb(world, world.player2);
        } else {
          placePlayerBomb(world, world.player);
          onBroadcastBombAction?.({
            action: 'PLACE',
            x: world.player.x,
            y: world.player.y,
            dir: world.player.dir,
          });
        }
        return;
      }

      // P2 Throw Bomb (ShiftRight or KeyL)
      if (e.code === 'ShiftRight' || e.code === 'KeyL') {
        e.preventDefault();
        if (world.isTwoPlayer && world.player2 && !world.player2.isAiBot) {
          throwPlayerBomb(world, world.player2);
        } else {
          throwPlayerBomb(world, world.player);
          onBroadcastBombAction?.({
            action: 'THROW',
            x: world.player.x,
            y: world.player.y,
            dir: world.player.dir,
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isTypingElement(e.target) || isTypingElement(document.activeElement)) {
        return;
      }
      const wasdDir = mapWasd(e.code);
      const arrowDir = mapArrows(e.code);
      if (wasdDir) p1KeysRef.current.delete(wasdDir);
      if (arrowDir) {
        p1KeysRef.current.delete(arrowDir);
        p2KeysRef.current.delete(arrowDir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, worldRef, onBroadcastEmote, onBroadcastBombAction]);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let hudTimer = 0;
    let netSyncTimer = 0;

    const renderLoop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const world = worldRef.current;

      if (status === 'PLAYING') {
        const p1Arr = Array.from(p1KeysRef.current);
        const p2Arr = Array.from(p2KeysRef.current);
        const activeDirP1 = touchDir || (p1Arr.length > 0 ? p1Arr[p1Arr.length - 1] : null);
        const activeDirP2 = p2Arr.length > 0 ? p2Arr[p2Arr.length - 1] : null;

        const res = stepGameWorld(world, dt, activeDirP1, activeDirP2);

        hudTimer += dt;
        if (hudTimer >= 0.08) {
          hudTimer = 0;
          onSyncHud();
        }

        netSyncTimer += dt;
        if (netSyncTimer >= 0.05 && world.isBattleRoyale && onBroadcastPlayerSync) {
          netSyncTimer = 0;
          onBroadcastPlayerSync({
            x: world.player.x,
            y: world.player.y,
            dir: world.player.dir,
            isMoving: world.player.isMoving,
            hp: world.player.hp,
            isAlive: world.player.isAlive,
            isGhost: world.player.isGhost,
          });
        }

        if (res.event === 'VICTORY' || res.event === 'GAME_OVER') {
          onSyncHud();
          onGameEnd(res.event);
        }
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.save();

          if (world.screenShake > 0) {
            const intensity = world.screenShake * 14;
            ctx.translate((Math.random() - 0.5) * intensity, (Math.random() - 0.5) * intensity);
          }

          // 1. Diorama Environment
          drawDioramaEnvironment(
            ctx,
            world.elapsedTime,
            world.level.biome,
            world.level.exitPos,
            world.enemies.length === 0
          );

          // 2. Teleport Portals, Spike Traps & Sudden Death Warnings on the Floor
          world.level.teleporters?.forEach((tp) => {
            drawTeleporterTile(
              ctx,
              DIORAMA_PAD_LEFT + tp.colA * TILE_SIZE,
              DIORAMA_PAD_TOP + tp.rowA * TILE_SIZE,
              TILE_SIZE,
              tp,
              world.elapsedTime
            );
            drawTeleporterTile(
              ctx,
              DIORAMA_PAD_LEFT + tp.colB * TILE_SIZE,
              DIORAMA_PAD_TOP + tp.rowB * TILE_SIZE,
              TILE_SIZE,
              tp,
              world.elapsedTime
            );
          });

          world.level.spikes?.forEach((trap) => {
            drawSpikeTrapTile(
              ctx,
              DIORAMA_PAD_LEFT + trap.col * TILE_SIZE,
              DIORAMA_PAD_TOP + trap.row * TILE_SIZE,
              TILE_SIZE,
              trap,
              world.elapsedTime
            );
          });

          if (world.fallingWarnings.length > 0) {
            drawSuddenDeathWarnings(ctx, world.fallingWarnings, world.elapsedTime);
          }

          // 3. Grid Obstacles
          for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
              const tile = world.grid[r][c];
              if (tile !== 'EMPTY' && tile !== 'EXIT') {
                drawTileObstacle(
                  ctx,
                  DIORAMA_PAD_LEFT + c * TILE_SIZE,
                  DIORAMA_PAD_TOP + r * TILE_SIZE,
                  TILE_SIZE,
                  tile,
                  world.elapsedTime
                );
              }
            }
          }

          // 4. Collectible Power-Up Items
          world.groundItems.forEach((item) => {
            drawItemCard(
              ctx,
              DIORAMA_PAD_LEFT + item.col * TILE_SIZE,
              DIORAMA_PAD_TOP + item.row * TILE_SIZE,
              TILE_SIZE,
              item.type,
              world.elapsedTime
            );
          });

          // 5. Bombs (Grounded, Sliding, or Airborne Thrown)
          world.bombs.forEach((b) => {
            drawBombSprite(
              ctx,
              DIORAMA_PAD_LEFT + b.x * TILE_SIZE,
              DIORAMA_PAD_TOP + b.y * TILE_SIZE,
              TILE_SIZE,
              b.timer,
              b.maxTimer,
              b.zHeight || 0
            );
          });

          // 6. Explosion Flames (Supports Custom Flame Colors!)
          drawFlameCross(ctx, world.flames);

          // 7. Monsters & Boss
          world.enemies.forEach((e) => {
            drawEnemySprite(
              ctx,
              DIORAMA_PAD_LEFT + (e.x + 0.5) * TILE_SIZE,
              DIORAMA_PAD_TOP + (e.y + 0.5) * TILE_SIZE,
              e
            );
          });

          // 8. Players (P1..P4 Alive Heroes + Revenge Ghosts!)
          const allHeroes = getAllHeroes(world);
          allHeroes.forEach((h) => {
            if (h.isAlive || h.isGhost) {
              const badge =
                allHeroes.length > 1 || h.displayName !== 'P1'
                  ? h.displayName || h.id
                  : undefined;
              drawHeroSprite(
                ctx,
                DIORAMA_PAD_LEFT + (h.x + 0.5) * TILE_SIZE,
                DIORAMA_PAD_TOP + (h.y + 0.5) * TILE_SIZE,
                TILE_SIZE,
                h.dir,
                h.animTime,
                h.isMoving,
                h.invulnerableTimer,
                h.skin,
                badge,
                h.kickTimer,
                h.throwTimer,
                h.isGhost,
                h.activeEmote
              );
            }
          });

          // 9. Debris Particles & Floating Texts
          drawParticles(ctx, world.particles);

          world.floatingTexts.forEach((ft) => {
            ctx.font = '800 13px "Chakra Petch", "Be Vietnam Pro", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#090d16';
            ctx.fillText(ft.text, ft.x + 1.5, ft.y + 1.5);
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y);
          });

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [status, touchDir, worldRef, onSyncHud, onGameEnd]);

  return (
    <div
      className={`relative border-x-2 border-b-2 border-[#2b426b] rounded-b-lg overflow-hidden shadow-[0_14px_35px_rgba(0,0,0,0.75)] bg-[#132a17] ${
        isMobileLandscape
          ? 'h-[calc(100dvh-42px)] max-h-[560px] w-auto max-w-full aspect-[872/560] mx-auto shrink-0'
          : 'w-full max-w-[872px]'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full block"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
