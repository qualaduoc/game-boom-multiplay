import {
  BASE_PLAYER_SPEED,
  BOMB_FUSE_SECONDS,
  DIORAMA_PAD_LEFT,
  DIORAMA_PAD_TOP,
  FLAME_DURATION_SECONDS,
  GRID_COLS,
  GRID_ROWS,
  MAX_BOMB_CAPACITY,
  MAX_FIRE_RANGE,
  MAX_SPEED_LEVEL,
  PLAYER_INVULNERABLE_SECONDS,
  SCORE_VALUES,
  SPEED_BOOST_PER_LEVEL,
  TILE_SIZE,
} from '../../constants/gameConstants';
import {
  BombEntity,
  Direction,
  EnemyEntity,
  FallingStoneWarning,
  FlameCell,
  FlameColorId,
  FloatingText,
  GroundItem,
  HeroSkinId,
  ItemType,
  LevelConfig,
  Particle,
  PlayerSlotId,
  PlayerState,
  TileType,
} from '../../types/gameTypes';
import { soundEngine } from '../../utils/soundEngine';

export interface GameWorld {
  level: LevelConfig;
  grid: TileType[][];
  hiddenItems: Map<string, ItemType>;
  groundItems: GroundItem[];
  player: PlayerState;
  player2: PlayerState | null;
  extraPlayers: PlayerState[]; // P3, P4 in 4-Player Battle Royale / Online Room
  isTwoPlayer: boolean;
  isBattleRoyale: boolean;
  bombs: BombEntity[];
  flames: FlameCell[];
  enemies: EnemyEntity[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  fallingWarnings: FallingStoneWarning[];
  suddenDeathSpiralIndex: number;
  suddenDeathTickTimer: number;
  suddenDeathAnnounced: boolean;
  score: number;
  coinsEarned: number;
  timeRemaining: number;
  screenShake: number;
  elapsedTime: number;
}

export function createHeroState(
  id: PlayerSlotId,
  col: number,
  row: number,
  level: LevelConfig,
  skin: HeroSkinId,
  flameColor: FlameColorId = 'CLASSIC_ORANGE',
  displayName?: string,
  isAiBot: boolean = false
): PlayerState {
  const bonusBombs = skin === 'SHADOW_NINJA' ? 1 : 0;
  const bonusFire = skin === 'ARCANE_MAGE' ? 1 : 0;
  const bonusSpeed = skin === 'PALADIN_GOLD' ? 1 : 0;

  return {
    id,
    displayName: displayName || id,
    skin,
    flameColor,
    isAiBot,
    aiDecisionTimer: 0.2,
    x: col,
    y: row,
    dir: col > GRID_COLS / 2 ? 'LEFT' : 'RIGHT',
    isMoving: false,
    animTime: 0,
    hp: 3,
    maxHp: 3,
    maxBombs: Math.min(MAX_BOMB_CAPACITY, level.initialBombs + bonusBombs),
    fireRange: Math.min(MAX_FIRE_RANGE, level.initialFire + bonusFire),
    speedLevel: Math.min(MAX_SPEED_LEVEL, level.initialSpeed + bonusSpeed),
    kickTimer: 0,
    throwTimer: 0,
    invulnerableTimer: 1.8,
    teleportCooldown: 0,
    isAlive: true,
    isGhost: false,
    ghostBombCooldown: 0,
    activeEmote: undefined,
    emoteTimer: 0,
  };
}

export function getAllHeroes(world: GameWorld): PlayerState[] {
  const list: PlayerState[] = [world.player];
  if (world.player2) list.push(world.player2);
  if (world.extraPlayers.length > 0) list.push(...world.extraPlayers);
  return list;
}

export interface RoomSlotMember {
  slot: string;
  username?: string;
  displayName: string;
  skin: HeroSkinId;
  flameColor: FlameColorId;
}

export function createGameWorld(
  level: LevelConfig,
  carryScore: number = 1250,
  isTwoPlayer: boolean = false,
  p1Skin: HeroSkinId = 'KNIGHT_RED',
  p2Skin: HeroSkinId = 'PALADIN_GOLD',
  p1Flame: FlameColorId = 'CLASSIC_ORANGE',
  isBattleRoyale: boolean = false,
  p1Name: string = 'P1',
  botCount: number = 3,
  roomMembers: RoomSlotMember[] = [],
  localSlot: PlayerSlotId = 'P1'
): GameWorld {
  const grid = level.grid.map((row) => [...row]);
  const p2Start = level.player2Start || { col: 0, row: GRID_ROWS - 1 };
  const p3Start = { col: GRID_COLS - 1, row: 0 };
  const p4Start = { col: GRID_COLS - 1, row: GRID_ROWS - 1 };

  // Defensive runtime sanitizer: guarantee all corner/spawn tiles and L-shaped escape zones are walkable
  const ensureSafeSpawn = (col: number, row: number) => {
    if (grid[row]?.[col] !== undefined) {
      grid[row][col] = 'EMPTY';
    }
    const horizNeighbor =
      col + 1 < GRID_COLS && grid[row]?.[col + 1] !== 'STONE'
        ? col + 1
        : col - 1 >= 0
          ? col - 1
          : col;
    const vertNeighbor =
      row + 1 < GRID_ROWS && grid[row + 1]?.[col] !== 'STONE'
        ? row + 1
        : row - 1 >= 0
          ? row - 1
          : row;
    if (grid[row]?.[horizNeighbor] !== undefined && grid[row][horizNeighbor] !== 'STONE') {
      grid[row][horizNeighbor] = 'EMPTY';
    }
    if (grid[vertNeighbor]?.[col] !== undefined && grid[vertNeighbor][col] !== 'STONE') {
      grid[vertNeighbor][col] = 'EMPTY';
    }
  };

  const p1Pos = isBattleRoyale ? { col: 0, row: 0 } : level.playerStart;
  ensureSafeSpawn(p1Pos.col, p1Pos.row);
  ensureSafeSpawn(p2Start.col, p2Start.row);
  if (isBattleRoyale) {
    ensureSafeSpawn(p3Start.col, p3Start.row);
    ensureSafeSpawn(p4Start.col, p4Start.row);
  }

  level.spikes?.forEach((s) => {
    if (grid[s.row]?.[s.col] !== undefined) grid[s.row][s.col] = 'EMPTY';
  });
  level.teleporters?.forEach((tp) => {
    if (grid[tp.rowA]?.[tp.colA] !== undefined) grid[tp.rowA][tp.colA] = 'EMPTY';
    if (grid[tp.rowB]?.[tp.colB] !== undefined) grid[tp.rowB][tp.colB] = 'EMPTY';
  });

  const hiddenItems = new Map<string, ItemType>();
  const groundItems: GroundItem[] = [];

  level.items.forEach((item, idx) => {
    const key = `${item.col},${item.row}`;
    if (item.exposed) {
      if (grid[item.row]?.[item.col] !== undefined && grid[item.row][item.col] === 'STONE') {
        grid[item.row][item.col] = 'EMPTY';
      }
      groundItems.push({
        id: `item-init-${idx}`,
        col: item.col,
        row: item.row,
        type: item.type,
        spawnTime: 0,
        immunityTimer: 1.0,
      });
    } else {
      hiddenItems.set(key, item.type);
    }
  });

  const enemies: EnemyEntity[] = level.enemies.map((e, idx) => {
    if (grid[e.row]?.[e.col] !== undefined && grid[e.row][e.col] !== 'EMPTY') {
      grid[e.row][e.col] = 'EMPTY';
    }
    const maxHp = e.type === 'BOSS_KING' ? 7 : e.type === 'MAGMA_SLIME' ? 2 : 1;
    const speed =
      e.type === 'BOSS_KING'
        ? 2.05
        : e.type === 'MAGMA_SLIME'
          ? 2.45
          : e.type === 'SKELETON'
            ? 2.15
            : e.type === 'PHANTOM'
              ? 1.85
              : 1.65;

    return {
      id: `enemy-${idx}-${Date.now()}`,
      type: e.type,
      x: e.col,
      y: e.row,
      dir: e.dir || 'LEFT',
      speed,
      hp: maxHp,
      maxHp,
      animTime: idx * 0.7,
      aiTimer: 0,
      hurtTimer: 0,
      isChasing: false,
      canPassSoftWalls: e.type === 'PHANTOM',
    };
  });

  const extraPlayers: PlayerState[] = [];
  let player2State: PlayerState | null = null;
  let localPlayerState: PlayerState;

  if (isBattleRoyale) {
    const allSlotPresets: {
      slot: PlayerSlotId;
      col: number;
      row: number;
      skin: HeroSkinId;
      flame: FlameColorId;
      botName: string;
    }[] = [
      {
        slot: 'P1',
        col: p1Pos.col,
        row: p1Pos.row,
        skin: p1Skin,
        flame: p1Flame,
        botName: 'BOT_KNIGHT',
      },
      {
        slot: 'P2',
        col: p2Start.col,
        row: p2Start.row,
        skin: p2Skin,
        flame: 'ICE_BLUE',
        botName: 'BOT_PALADIN',
      },
      {
        slot: 'P3',
        col: p3Start.col,
        row: p3Start.row,
        skin: 'SHADOW_NINJA',
        flame: 'SHADOW_PURPLE',
        botName: 'BOT_NINJA',
      },
      {
        slot: 'P4',
        col: p4Start.col,
        row: p4Start.row,
        skin: 'ARCANE_MAGE',
        flame: 'EMERALD_TOXIC',
        botName: 'BOT_MAGE',
      },
    ];

    const localPreset = allSlotPresets.find((p) => p.slot === localSlot) || allSlotPresets[0];
    const localMember = roomMembers.find((m) => m.slot === localPreset.slot);

    localPlayerState = createHeroState(
      localPreset.slot,
      localPreset.col,
      localPreset.row,
      level,
      localMember?.skin || p1Skin,
      localMember?.flameColor || p1Flame,
      localMember?.displayName || p1Name,
      false
    );

    let botsSpawned = 0;
    const maxBots = Math.max(0, Math.min(3, Math.floor(botCount)));

    for (const preset of allSlotPresets) {
      if (preset.slot === localPreset.slot) continue;

      const humanMember = roomMembers.find((m) => m.slot === preset.slot);
      if (humanMember) {
        const hero = createHeroState(
          preset.slot,
          preset.col,
          preset.row,
          level,
          humanMember.skin || preset.skin,
          humanMember.flameColor || preset.flame,
          humanMember.displayName,
          false
        );
        extraPlayers.push(hero);
      } else if (botsSpawned < maxBots) {
        botsSpawned += 1;
        const botHero = createHeroState(
          preset.slot,
          preset.col,
          preset.row,
          level,
          preset.skin,
          preset.flame,
          preset.botName,
          true
        );
        extraPlayers.push(botHero);
      }
    }
  } else {
    localPlayerState = createHeroState(
      'P1',
      p1Pos.col,
      p1Pos.row,
      level,
      p1Skin,
      p1Flame,
      p1Name,
      false
    );
    if (isTwoPlayer) {
      player2State = createHeroState('P2', p2Start.col, p2Start.row, level, p2Skin, 'ICE_BLUE', 'P2');
    }
  }

  const world: GameWorld = {
    level,
    grid,
    hiddenItems,
    groundItems,
    player: localPlayerState,
    player2: player2State,
    extraPlayers,
    isTwoPlayer: isTwoPlayer && !isBattleRoyale,
    isBattleRoyale,
    bombs: [],
    flames: [],
    enemies,
    particles: [],
    floatingTexts: [],
    fallingWarnings: [],
    suddenDeathSpiralIndex: 0,
    suddenDeathTickTimer: 0,
    suddenDeathAnnounced: false,
    score: carryScore,
    coinsEarned: 0,
    timeRemaining: isBattleRoyale ? 110 : level.timeLimitSec,
    screenShake: 0,
    elapsedTime: 0,
  };

  if (level.code === '1-3' && !isBattleRoyale) {
    world.bombs.push({
      id: 'demo-bomb-start',
      ownerId: 'P1',
      flameColor: p1Flame,
      col: 2,
      row: 3,
      x: 2,
      y: 3,
      vx: 0,
      vy: 0,
      timer: 2.8,
      maxTimer: 2.8,
      range: 2,
      ownerCanPass: true,
      isDemoSafe: true,
    });
    spawnCrossFlameShowcase(world, 4, 3, 2, p1Flame);
  }

  return world;
}

export function syncRoomMembersIntoWorld(
  world: GameWorld,
  roomMembers: RoomSlotMember[],
  botCount: number
): void {
  if (!world.isBattleRoyale) return;
  const p2Start = world.level.player2Start || { col: 0, row: GRID_ROWS - 1 };
  const allSlotPresets: {
    slot: PlayerSlotId;
    col: number;
    row: number;
    skin: HeroSkinId;
    flame: FlameColorId;
    botName: string;
  }[] = [
    {
      slot: 'P1',
      col: 0,
      row: 0,
      skin: 'KNIGHT_RED',
      flame: 'CLASSIC_ORANGE',
      botName: 'BOT_KNIGHT',
    },
    {
      slot: 'P2',
      col: p2Start.col,
      row: p2Start.row,
      skin: 'PALADIN_GOLD',
      flame: 'ICE_BLUE',
      botName: 'BOT_PALADIN',
    },
    {
      slot: 'P3',
      col: GRID_COLS - 1,
      row: 0,
      skin: 'SHADOW_NINJA',
      flame: 'SHADOW_PURPLE',
      botName: 'BOT_NINJA',
    },
    {
      slot: 'P4',
      col: GRID_COLS - 1,
      row: GRID_ROWS - 1,
      skin: 'ARCANE_MAGE',
      flame: 'EMERALD_TOXIC',
      botName: 'BOT_MAGE',
    },
  ];

  const localSlot = world.player.id;
  const existingBySlot = new Map<PlayerSlotId, PlayerState>();
  if (world.player2) existingBySlot.set(world.player2.id, world.player2);
  world.extraPlayers.forEach((ep) => existingBySlot.set(ep.id, ep));

  let botsCount = 0;
  const maxBots = Math.max(0, Math.min(3, Math.floor(botCount)));
  const nextExtra: PlayerState[] = [];

  for (const preset of allSlotPresets) {
    const humanMember = roomMembers.find((m) => m.slot === preset.slot);
    if (preset.slot === localSlot) {
      if (humanMember) {
        world.player.displayName = humanMember.displayName;
        world.player.skin = humanMember.skin || world.player.skin;
        world.player.flameColor = humanMember.flameColor || world.player.flameColor;
      }
      continue;
    }

    const prev = existingBySlot.get(preset.slot);

    if (humanMember) {
      if (prev && !prev.isAiBot) {
        prev.displayName = humanMember.displayName;
        prev.skin = humanMember.skin || prev.skin;
        prev.flameColor = humanMember.flameColor || prev.flameColor;
        nextExtra.push(prev);
      } else {
        const joinedHero = createHeroState(
          preset.slot,
          preset.col,
          preset.row,
          world.level,
          humanMember.skin || preset.skin,
          humanMember.flameColor || preset.flame,
          humanMember.displayName,
          false
        );
        addFloatingText(
          world,
          preset.col,
          preset.row,
          `🎉 ${humanMember.displayName} VÀO PHÒNG!`,
          '#34d399'
        );
        nextExtra.push(joinedHero);
      }
    } else if (botsCount < maxBots) {
      botsCount += 1;
      if (prev && prev.isAiBot) {
        nextExtra.push(prev);
      } else {
        const botHero = createHeroState(
          preset.slot,
          preset.col,
          preset.row,
          world.level,
          preset.skin,
          preset.flame,
          preset.botName,
          true
        );
        nextExtra.push(botHero);
      }
    }
  }

  world.player2 = null;
  world.extraPlayers = nextExtra;
}

function spawnCrossFlameShowcase(
  world: GameWorld,
  centerCol: number,
  centerRow: number,
  range: number,
  flameColor: FlameColorId
): void {
  const dur = 1.15;
  world.flames.push({
    col: centerCol,
    row: centerRow,
    part: 'CENTER',
    isTip: false,
    timer: dur,
    maxTimer: dur,
    flameColor,
  });
  const dirs: { dc: number; dr: number; part: FlameCell['part'] }[] = [
    { dc: 0, dr: -1, part: 'UP' },
    { dc: 0, dr: 1, part: 'DOWN' },
    { dc: -1, dr: 0, part: 'LEFT' },
    { dc: 1, dr: 0, part: 'RIGHT' },
  ];
  dirs.forEach(({ dc, dr, part }) => {
    for (let step = 1; step <= range; step++) {
      world.flames.push({
        col: centerCol + dc * step,
        row: centerRow + dr * step,
        part,
        isTip: step === range,
        timer: dur,
        maxTimer: dur,
        flameColor,
      });
    }
  });
  spawnTileDebris(world, centerCol - 1, centerRow - 1, 'BRICK');
  spawnTileDebris(world, centerCol + 1, centerRow - 1, 'BRICK');
  spawnTileDebris(world, centerCol - 1, centerRow + 1, 'BRICK');
  spawnTileDebris(world, centerCol + 1, centerRow + 1, 'BRICK');
}

export function spawnTileDebris(
  world: GameWorld,
  col: number,
  row: number,
  kind: 'BRICK' | 'LEAF' | 'SPARKLE'
): void {
  const cx = DIORAMA_PAD_LEFT + (col + 0.5) * TILE_SIZE;
  const cy = DIORAMA_PAD_TOP + (row + 0.5) * TILE_SIZE;
  const count = kind === 'BRICK' ? 14 : 10;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
    const speed = 38 + Math.random() * 90;
    world.particles.push({
      x: cx + (Math.random() - 0.5) * 18,
      y: cy + (Math.random() - 0.5) * 18,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 45,
      size: kind === 'BRICK' ? 7 + Math.random() * 5 : 5 + Math.random() * 4,
      color:
        kind === 'BRICK'
          ? i % 2 === 0
            ? '#cc5833'
            : '#a84220'
          : kind === 'LEAF'
            ? '#4ade80'
            : '#fde047',
      highlightColor: kind === 'BRICK' ? '#f28b66' : '#fef08a',
      borderColor: kind === 'BRICK' ? '#3b1509' : '#14532d',
      life: 0.6 + Math.random() * 0.35,
      maxLife: 0.95,
      gravity: 200,
      kind,
    });
  }
}

export function addFloatingText(
  world: GameWorld,
  col: number,
  row: number,
  text: string,
  color: string
): void {
  world.floatingTexts.push({
    id: `ft-${Date.now()}-${Math.random()}`,
    x: DIORAMA_PAD_LEFT + (col + 0.5) * TILE_SIZE,
    y: DIORAMA_PAD_TOP + row * TILE_SIZE,
    text,
    color,
    life: 1.0,
    maxLife: 1.0,
  });
}

export function triggerPlayerEmote(
  world: GameWorld,
  actor: PlayerState,
  emote: string
): void {
  actor.activeEmote = emote;
  actor.emoteTimer = 2.8;
  soundEngine.playPickupItem();
  addFloatingText(world, actor.x, actor.y, `${actor.id} ${emote}`, '#fde047');
}

export function isTileWalkable(
  world: GameWorld,
  col: number,
  row: number,
  ignoreBombAt?: { col: number; row: number },
  canPassSoftWalls: boolean = false
): boolean {
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return false;
  const tile = world.grid[row][col];
  if (tile === 'STONE') return false;
  if (!canPassSoftWalls && (tile === 'BRICK' || tile === 'BUSH')) return false;

  const hasBomb = world.bombs.some(
    (b) =>
      !b.isAirborne &&
      Math.round(b.x) === col &&
      Math.round(b.y) === row &&
      !(ignoreBombAt && ignoreBombAt.col === col && ignoreBombAt.row === row)
  );
  return !hasBomb;
}

export function placePlayerBomb(world: GameWorld, actor: PlayerState = world.player): void {
  // Revenge Ghost Bomber: Dead players in Multi/2P can drop spectral curse bombs every 4.5s!
  if (!actor.isAlive) {
    if (actor.isGhost) {
      if (actor.ghostBombCooldown > 0) {
        addFloatingText(
          world,
          actor.x,
          actor.y,
          `MA HỒI CHIÊU ${Math.ceil(actor.ghostBombCooldown)}s 👻`,
          '#c084fc'
        );
        return;
      }
      const gCol = Math.round(actor.x);
      const gRow = Math.round(actor.y);
      if (world.grid[gRow]?.[gCol] !== 'EMPTY') return;
      actor.ghostBombCooldown = 4.5;
      world.bombs.push({
        id: `ghost-bomb-${Date.now()}-${Math.random()}`,
        ownerId: actor.id,
        flameColor: 'SHADOW_PURPLE',
        isGhostCurse: true,
        col: gCol,
        row: gRow,
        x: gCol,
        y: gRow,
        vx: 0,
        vy: 0,
        timer: 2.0,
        maxTimer: 2.0,
        range: 1,
        ownerCanPass: true,
        teleportCooldown: 0,
      });
      soundEngine.playPlaceBomb();
      addFloatingText(world, gCol, gRow, 'BOM BÁO THÙ! 👻', '#c084fc');
    }
    return;
  }

  const activeCount = world.bombs.filter((b) => b.ownerId === actor.id).length;
  if (activeCount >= actor.maxBombs) return;

  const col = Math.round(actor.x);
  const row = Math.round(actor.y);
  if (world.bombs.some((b) => !b.isAirborne && Math.round(b.x) === col && Math.round(b.y) === row))
    return;
  if (world.grid[row]?.[col] === 'EXIT') return;

  world.bombs.push({
    id: `bomb-${Date.now()}-${Math.random()}`,
    ownerId: actor.id,
    flameColor: actor.flameColor,
    col,
    row,
    x: col,
    y: row,
    vx: 0,
    vy: 0,
    timer: BOMB_FUSE_SECONDS,
    maxTimer: BOMB_FUSE_SECONDS,
    range: actor.fireRange,
    ownerCanPass: true,
    teleportCooldown: 0,
  });
  soundEngine.playPlaceBomb();
}

export function throwPlayerBomb(world: GameWorld, actor: PlayerState = world.player): void {
  if (!actor.isAlive) {
    if (actor.isGhost) {
      placePlayerBomb(world, actor);
    }
    return;
  }
  if (actor.throwTimer <= 0) {
    addFloatingText(world, actor.x, actor.y, 'CẦN GĂNG NÉM! 🥊', '#94a3b8');
    return;
  }
  const col = Math.round(actor.x);
  const row = Math.round(actor.y);
  const dVec =
    actor.dir === 'UP'
      ? { dc: 0, dr: -1 }
      : actor.dir === 'DOWN'
        ? { dc: 0, dr: 1 }
        : actor.dir === 'LEFT'
          ? { dc: -1, dr: 0 }
          : { dc: 1, dr: 0 };

  let bomb = world.bombs.find(
    (b) =>
      !b.isAirborne &&
      ((Math.round(b.x) === col && Math.round(b.y) === row) ||
        (Math.round(b.x) === col + dVec.dc && Math.round(b.y) === row + dVec.dr))
  );

  if (!bomb) {
    const activeCount = world.bombs.filter((b) => b.ownerId === actor.id).length;
    if (activeCount >= actor.maxBombs) return;
    bomb = {
      id: `bomb-throw-${Date.now()}-${Math.random()}`,
      ownerId: actor.id,
      flameColor: actor.flameColor,
      col,
      row,
      x: col,
      y: row,
      vx: 0,
      vy: 0,
      timer: BOMB_FUSE_SECONDS + 0.3,
      maxTimer: BOMB_FUSE_SECONDS + 0.3,
      range: actor.fireRange,
      ownerCanPass: false,
      teleportCooldown: 0,
    };
    world.bombs.push(bomb);
  }

  let targetCol = Math.max(0, Math.min(GRID_COLS - 1, Math.round(bomb.x) + dVec.dc * 3));
  let targetRow = Math.max(0, Math.min(GRID_ROWS - 1, Math.round(bomb.y) + dVec.dr * 3));

  for (let bounce = 0; bounce < 4; bounce++) {
    if (
      isTileWalkable(world, targetCol, targetRow, {
        col: Math.round(bomb.x),
        row: Math.round(bomb.y),
      })
    ) {
      break;
    }
    targetCol = Math.max(0, Math.min(GRID_COLS - 1, targetCol + dVec.dc));
    targetRow = Math.max(0, Math.min(GRID_ROWS - 1, targetRow + dVec.dr));
  }

  bomb.isAirborne = true;
  bomb.vx = 0;
  bomb.vy = 0;
  bomb.throwStartX = bomb.x;
  bomb.throwStartY = bomb.y;
  bomb.throwTargetCol = targetCol;
  bomb.throwTargetRow = targetRow;
  bomb.throwProgress = 0;
  bomb.throwDir = actor.dir;
  bomb.zHeight = 0;

  soundEngine.playThrowBomb();
  addFloatingText(world, actor.x, actor.y, `NÉM! (${Math.ceil(actor.throwTimer)}s) ☄️`, '#38bdf8');
}

export function detonateBomb(world: GameWorld, bomb: BombEntity): void {
  soundEngine.playExplosion();
  world.screenShake = 0.25;
  const bCol = Math.round(bomb.x);
  const bRow = Math.round(bomb.y);
  const flameColor = bomb.flameColor || 'CLASSIC_ORANGE';

  const createFlame = (c: number, r: number, part: FlameCell['part'], isTip: boolean) => {
    world.flames.push({
      col: c,
      row: r,
      part,
      isTip,
      timer: FLAME_DURATION_SECONDS,
      maxTimer: FLAME_DURATION_SECONDS,
      flameColor,
    });
  };

  createFlame(bCol, bRow, 'CENTER', false);

  const directions: { dc: number; dr: number; part: FlameCell['part'] }[] = [
    { dc: 0, dr: -1, part: 'UP' },
    { dc: 0, dr: 1, part: 'DOWN' },
    { dc: -1, dr: 0, part: 'LEFT' },
    { dc: 1, dr: 0, part: 'RIGHT' },
  ];

  directions.forEach(({ dc, dr, part }) => {
    for (let step = 1; step <= bomb.range; step++) {
      const c = bCol + dc * step;
      const r = bRow + dr * step;
      if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) break;

      const tile = world.grid[r][c];
      if (tile === 'STONE') break;

      const otherBomb = world.bombs.find(
        (b) => !b.isAirborne && Math.round(b.x) === c && Math.round(b.y) === r && b.id !== bomb.id
      );
      if (otherBomb) {
        otherBomb.timer = Math.min(otherBomb.timer, 0.05);
      }

      if (tile === 'BRICK' || tile === 'BUSH' || tile === 'CHEST') {
        world.grid[r][c] = 'EMPTY';
        createFlame(c, r, part, true);

        if (tile === 'CHEST') {
          world.score += SCORE_VALUES.CHEST_OPEN;
          world.coinsEarned += 25;
          soundEngine.playChestOpen();
          spawnTileDebris(world, c, r, 'SPARKLE');
          addFloatingText(world, c, r, '+25 XU & SKILL!', '#fde047');
        } else {
          const pts = tile === 'BRICK' ? SCORE_VALUES.BRICK_DESTROY : SCORE_VALUES.BUSH_DESTROY;
          world.score += pts;
          spawnTileDebris(world, c, r, tile === 'BRICK' ? 'BRICK' : 'LEAF');
          addFloatingText(world, c, r, `+${pts}`, '#fed7aa');
        }

        const key = `${c},${r}`;
        const hiddenType = world.hiddenItems.get(key);
        if (hiddenType) {
          world.hiddenItems.delete(key);
          world.groundItems.push({
            id: `item-${Date.now()}-${Math.random()}`,
            col: c,
            row: r,
            type: hiddenType,
            spawnTime: world.elapsedTime,
            immunityTimer: 0.75,
          });
        } else if (tile === 'CHEST') {
          const skillType: ItemType = (c + r) % 2 === 0 ? 'KICK_BOOT' : 'THROW_GLOVE';
          world.groundItems.push({
            id: `item-chest-${Date.now()}-${Math.random()}`,
            col: c,
            row: r,
            type: skillType,
            spawnTime: world.elapsedTime,
            immunityTimer: 0.85,
          });
        } else if (Math.random() < 0.2) {
          const pool: ItemType[] = [
            'BOMB_UP',
            'FIRE_UP',
            'SPEED_UP',
            'KICK_BOOT',
            'THROW_GLOVE',
            'HEART',
          ];
          world.groundItems.push({
            id: `item-${Date.now()}-${Math.random()}`,
            col: c,
            row: r,
            type: pool[Math.floor(Math.random() * pool.length)],
            spawnTime: world.elapsedTime,
            immunityTimer: 0.75,
          });
        }
        break;
      }

      createFlame(c, r, part, step === bomb.range);
    }
  });
}

export function collectGroundItem(
  world: GameWorld,
  item: GroundItem,
  collector: PlayerState = world.player
): void {
  soundEngine.playPickupItem();
  world.score += SCORE_VALUES.ITEM_PICKUP;
  world.coinsEarned += 5;

  if (item.type === 'BOMB_UP') {
    collector.maxBombs = Math.min(MAX_BOMB_CAPACITY, collector.maxBombs + 1);
    addFloatingText(world, item.col, item.row, `${collector.id} BOM +1 💣`, '#38bdf8');
  } else if (item.type === 'FIRE_UP') {
    collector.fireRange = Math.min(MAX_FIRE_RANGE, collector.fireRange + 1);
    addFloatingText(world, item.col, item.row, `${collector.id} LỬA +1 🔥`, '#fb923c');
  } else if (item.type === 'SPEED_UP') {
    collector.speedLevel = Math.min(MAX_SPEED_LEVEL, collector.speedLevel + 1);
    addFloatingText(world, item.col, item.row, `${collector.id} TỐC ĐỘ +1 🥾`, '#4ade80');
  } else if (item.type === 'HEART') {
    collector.hp = Math.min(collector.maxHp, collector.hp + 1);
    addFloatingText(world, item.col, item.row, `${collector.id} MÁU +1 ❤️`, '#f87171');
  } else if (item.type === 'KICK_BOOT') {
    collector.kickTimer = Math.min(25, collector.kickTimer + 14);
    addFloatingText(world, item.col, item.row, `${collector.id} ĐÁ BOM 14s! 👟`, '#34d399');
  } else if (item.type === 'THROW_GLOVE') {
    collector.throwTimer = Math.min(25, collector.throwTimer + 14);
    addFloatingText(world, item.col, item.row, `${collector.id} NÉM BOM 14s! 🥊`, '#38bdf8');
  }
}

export function getPlayerSpeed(player: PlayerState): number {
  if (player.isGhost) return BASE_PLAYER_SPEED + 0.8;
  return BASE_PLAYER_SPEED + (player.speedLevel - 1) * SPEED_BOOST_PER_LEVEL;
}

export function damagePlayer(
  world: GameWorld,
  target: PlayerState = world.player
): 'ALIVE' | 'BATTLE_VICTORY' | 'ALL_DEAD' {
  if (!target.isAlive || target.invulnerableTimer > 0) return 'ALIVE';
  target.hp -= 1;
  target.invulnerableTimer = PLAYER_INVULNERABLE_SECONDS;
  world.screenShake = 0.35;
  soundEngine.playPlayerHurt();
  addFloatingText(world, target.x, target.y, `${target.id} -1 ❤️`, '#ef4444');

  const allHeroes = getAllHeroes(world);

  if (target.hp <= 0) {
    target.isAlive = false;
    // Transform into Revenge Ghost if in Multiplayer / 2P / Battle Royale and others are still alive!
    const livingRemaining = allHeroes.filter((h) => h.isAlive);
    if (world.isTwoPlayer && livingRemaining.length >= 1) {
      target.isGhost = true;
      target.ghostBombCooldown = 2.0;
      addFloatingText(world, target.x, target.y, `${target.id} HÓA BÓNG MA BÁO THÙ! 👻`, '#c084fc');
    }
  }

  const livingHeroes = allHeroes.filter((h) => h.isAlive);
  if (world.isBattleRoyale && allHeroes.length > 1) {
    if (!world.player.isAlive && livingHeroes.every((h) => h.isAiBot)) {
      return 'ALL_DEAD';
    }
    if (livingHeroes.length <= 1 && world.player.isAlive) {
      return 'BATTLE_VICTORY';
    }
  }

  return livingHeroes.length > 0 ? 'ALIVE' : 'ALL_DEAD';
}

export type { Direction };
