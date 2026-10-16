import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LEVELS } from '../config/levelsConfig';
import { rollFunnyNickname } from '../constants/gameConstants';
import { GameCanvas } from '../features/arena/GameCanvas';
import {
  createGameWorld,
  GameWorld,
  placePlayerBomb,
  syncRoomMembersIntoWorld,
  throwPlayerBomb,
  triggerPlayerEmote,
} from '../features/arena/gameEngine';
import { GameModals } from '../features/controls/GameModals';
import { TouchControls } from '../features/controls/TouchControls';
import { TopHudBar } from '../features/hud/TopHudBar';
import {
  HubTab,
  LobbyShopModal,
  RoomMemberInfo,
} from '../features/multiplayer/LobbyShopModal';
import {
  fetchPublicRooms,
  getSavedUser,
  PublicRoomSummary,
  rewardMatchCoins,
  saveUserLocal,
} from '../services/authShopService';
import { fetchLeaderboard, submitHighScore } from '../services/scoreService';
import {
  Direction,
  FlameColorId,
  GameStatus,
  HeroSkinId,
  LeaderboardEntry,
  PlayerSlotId,
  UserProfile,
} from '../types/gameTypes';
import { soundEngine } from '../utils/soundEngine';

const SKIN_ORDER: HeroSkinId[] = ['KNIGHT_RED', 'PALADIN_GOLD', 'SHADOW_NINJA', 'ARCANE_MAGE'];

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => getSavedUser());
  const [levelIdx, setLevelIdx] = useState<number>(0);
  const [isTwoPlayer, setIsTwoPlayer] = useState<boolean>(false);
  const [isBattleRoyale, setIsBattleRoyale] = useState<boolean>(false);
  const [p1Skin, setP1Skin] = useState<HeroSkinId>(() => getSavedUser()?.equippedSkin || 'KNIGHT_RED');
  const [p2Skin, setP2Skin] = useState<HeroSkinId>('PALADIN_GOLD');
  const [p1Flame, setP1Flame] = useState<FlameColorId>(
    () => getSavedUser()?.equippedFlame || 'CLASSIC_ORANGE'
  );

  // Show Login / Quick Play Gate immediately when accessing the game link
  const [hubOpen, setHubOpen] = useState<boolean>(true);
  const [hubTab, setHubTab] = useState<HubTab>('AUTH');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [assignedSlot, setAssignedSlot] = useState<PlayerSlotId>('P1');
  const assignedSlotRef = useRef<PlayerSlotId>('P1');
  const [roomMembers, setRoomMembers] = useState<RoomMemberInfo[]>([]);
  const [publicRooms, setPublicRooms] = useState<PublicRoomSummary[]>([]);
  const [roomNotice, setRoomNotice] = useState<{ text: string; isError?: boolean } | null>(null);
  // Default to 0 bots when creating a room (wait for real players unless user selects bots!)
  const [roomBotCount, setRoomBotCount] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  const worldRef = useRef<GameWorld>(
    createGameWorld(
      LEVELS[0],
      1250,
      false,
      getSavedUser()?.equippedSkin || 'KNIGHT_RED',
      'PALADIN_GOLD',
      getSavedUser()?.equippedFlame || 'CLASSIC_ORANGE',
      false,
      getSavedUser()?.displayName || rollFunnyNickname(),
      0,
      [],
      'P1'
    )
  );

  const [status, setStatus] = useState<GameStatus>('PLAYING');
  const [touchDir, setTouchDir] = useState<Direction | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Responsive Smartphone Landscape & Touch Detection
  const [isMobileLandscape, setIsMobileLandscape] = useState<boolean>(false);
  const [isPortraitMobile, setIsPortraitMobile] = useState<boolean>(false);
  const [showGamepad, setShowGamepad] = useState<boolean>(false);

  const [hudState, setHudState] = useState({
    hp: 3,
    maxHp: 3,
    p2Hp: 3,
    bombsCount: LEVELS[0].initialBombs,
    fireRange: LEVELS[0].initialFire,
    speedLevel: LEVELS[0].initialSpeed,
    kickTimer: 0,
    throwTimer: 0,
    levelCode: LEVELS[0].code,
    timeRemaining: LEVELS[0].timeLimitSec,
    score: 1250,
    coinsEarned: 0,
    enemiesRemaining: LEVELS[0].enemies.length,
  });

  useEffect(() => {
    const checkViewport = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;

      const landscapeCompact = w > h && h <= 560;
      const portraitNarrow = h > w && w < 768;

      setIsMobileLandscape(landscapeCompact);
      setIsPortraitMobile(portraitNarrow);
      if (isTouch || landscapeCompact || portraitNarrow) {
        setShowGamepad(true);
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    window.addEventListener('orientationchange', checkViewport);
    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('orientationchange', checkViewport);
    };
  }, []);

  useEffect(() => {
    fetchLeaderboard().then(setLeaderboard);
    fetchPublicRooms().then(setPublicRooms);
    const unlockAudio = () => {
      soundEngine.startBgm();
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('pointerdown', unlockAudio);
    return () => {
      soundEngine.stopBgm();
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
    };
  }, []);

  const syncHud = useCallback(() => {
    const w = worldRef.current;
    setHudState({
      hp: w.player.hp,
      maxHp: w.player.maxHp,
      p2Hp: w.player2 ? w.player2.hp : 0,
      bombsCount: w.player.maxBombs,
      fireRange: w.player.fireRange,
      speedLevel: w.player.speedLevel,
      kickTimer: w.player.kickTimer,
      throwTimer: w.player.throwTimer,
      levelCode: w.level.code,
      timeRemaining: w.timeRemaining,
      score: w.score,
      coinsEarned: w.coinsEarned,
      enemiesRemaining: w.enemies.length,
    });
  }, []);

  const loadLevelByIndex = useCallback(
    (
      idx: number,
      carryScore: number = 1250,
      twoP: boolean = isTwoPlayer,
      skin1: HeroSkinId = p1Skin,
      skin2: HeroSkinId = p2Skin,
      flame1: FlameColorId = p1Flame,
      battleRoyale: boolean = isBattleRoyale,
      p1DisplayName: string = user?.displayName || 'THAY_DUOC',
      botsCount: number = roomBotCount,
      membersList: RoomMemberInfo[] = roomMembers,
      localSlot: PlayerSlotId = assignedSlotRef.current
    ) => {
      const targetLevel = LEVELS[idx] || LEVELS[0];
      setLevelIdx(idx);
      worldRef.current = createGameWorld(
        targetLevel,
        carryScore,
        twoP,
        skin1,
        skin2,
        flame1,
        battleRoyale,
        p1DisplayName,
        botsCount,
        membersList,
        localSlot
      );
      setStatus('PLAYING');
      syncHud();
    },
    [isTwoPlayer, p1Skin, p2Skin, p1Flame, isBattleRoyale, user, roomBotCount, roomMembers, syncHud]
  );

  const handleGameEnd = useCallback(
    (result: 'VICTORY' | 'GAME_OVER') => {
      setStatus(result);
      const w = worldRef.current;
      const earned = Math.max(result === 'VICTORY' ? 60 : 15, w.coinsEarned);

      if (user) {
        rewardMatchCoins(user.id, earned, result === 'VICTORY').then((updated) => {
          if (updated) {
            setUser(updated);
          } else {
            const localUpdated: UserProfile = {
              ...user,
              coins: user.coins + earned,
              wins: user.wins + (result === 'VICTORY' ? 1 : 0),
              eloRating: user.eloRating + (result === 'VICTORY' ? 25 : 0),
            };
            saveUserLocal(localUpdated);
            setUser(localUpdated);
          }
        });
      }

      submitHighScore({
        player_name: user?.displayName || 'THAY_DUOC',
        level_code: w.level.code,
        score: Math.floor(w.score),
        time_remaining_sec: Math.ceil(w.timeRemaining),
      }).then(setLeaderboard);
    },
    [user]
  );

  const handleUserUpdated = (nextUser: UserProfile | null) => {
    setUser(nextUser);
    if (nextUser) {
      setP1Skin(nextUser.equippedSkin);
      setP1Flame(nextUser.equippedFlame);
      worldRef.current.player.skin = nextUser.equippedSkin;
      worldRef.current.player.flameColor = nextUser.equippedFlame;
      worldRef.current.player.displayName = nextUser.displayName;
      syncHud();
    }
  };

  const handleWsMessage = useCallback(
    (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(String(ev.data));
        if (msg.type === 'ROOMS_LIST' && Array.isArray(msg.rooms)) {
          setPublicRooms(msg.rooms);
        } else if (msg.type === 'ROOM_ERROR') {
          setRoomNotice({
            text: msg.error || 'Không thể vào phòng!',
            isError: true,
          });
        } else if (msg.type === 'LEFT_ROOM') {
          setRoomCode(null);
          setRoomMembers([]);
          setAssignedSlot('P1');
          assignedSlotRef.current = 'P1';
          setRoomNotice({ text: 'Đã rời phòng đấu.' });
        } else if (msg.type === 'JOINED_ROOM') {
          setRoomCode(msg.roomCode);
          const slot = (msg.assignedSlot as PlayerSlotId) || 'P1';
          setAssignedSlot(slot);
          assignedSlotRef.current = slot;
          if (typeof msg.botCount === 'number') {
            setRoomBotCount(msg.botCount);
          }
          if (Array.isArray(msg.members)) {
            setRoomMembers(msg.members);
          }
          if (msg.isNewRoom) {
            setRoomNotice({
              text: `✅ Đã tạo Phòng mới #${msg.roomCode} thành công! Bạn là Chủ phòng (${slot}). Hãy bảo bạn bè chọn Phòng #${msg.roomCode} ở danh sách bên dưới để JOIN!`,
            });
          } else {
            setRoomNotice({
              text: `🎉 Đã JOIN thành công vào Phòng #${msg.roomCode} của Chủ phòng ${msg.hostDisplayName || 'P1'} (@${msg.hostUsername || 'host'})! Vị trí của bạn: ${slot}.`,
            });
          }
        } else if (msg.type === 'ROOM_UPDATE') {
          setRoomCode(msg.roomCode);
          const nextMembers: RoomMemberInfo[] = msg.members || [];
          const nextBots: number =
            typeof msg.botCount === 'number' ? msg.botCount : roomBotCount;
          setRoomMembers(nextMembers);
          setRoomBotCount(nextBots);
          if (worldRef.current.isBattleRoyale) {
            syncRoomMembersIntoWorld(worldRef.current, nextMembers, nextBots);
            syncHud();
          }
        } else if (msg.type === 'MATCH_STARTED') {
          const matchBots =
            typeof msg.botCount === 'number' ? msg.botCount : roomBotCount;
          const matchMembers: RoomMemberInfo[] = msg.members || roomMembers;
          const activeUser = user || getSavedUser();
          setRoomBotCount(matchBots);
          setRoomMembers(matchMembers);
          setIsBattleRoyale(true);
          setHubOpen(false);
          loadLevelByIndex(
            levelIdx,
            1250,
            true,
            activeUser?.equippedSkin || p1Skin,
            p2Skin,
            activeUser?.equippedFlame || p1Flame,
            true,
            activeUser?.displayName || 'THAY_DUOC',
            matchBots,
            matchMembers,
            assignedSlotRef.current
          );
        } else if (msg.type === 'PLAYER_SYNC' && msg.slot) {
          const w = worldRef.current;
          const target = w.extraPlayers.find((ep) => ep.id === msg.slot);
          if (target && !target.isAiBot) {
            target.x = typeof msg.x === 'number' ? msg.x : target.x;
            target.y = typeof msg.y === 'number' ? msg.y : target.y;
            if (msg.dir) target.dir = msg.dir;
            target.isMoving = Boolean(msg.isMoving);
            if (target.isMoving) {
              target.animTime += 0.08;
            }
            if (typeof msg.hp === 'number') target.hp = msg.hp;
            if (typeof msg.isAlive === 'boolean') target.isAlive = msg.isAlive;
            if (typeof msg.isGhost === 'boolean') target.isGhost = msg.isGhost;
          }
        } else if (msg.type === 'BOMB_ACTION' && msg.slot) {
          const w = worldRef.current;
          const target = w.extraPlayers.find((ep) => ep.id === msg.slot);
          if (target && !target.isAiBot) {
            if (typeof msg.x === 'number') target.x = msg.x;
            if (typeof msg.y === 'number') target.y = msg.y;
            if (msg.dir) target.dir = msg.dir;
            if (msg.action === 'THROW') {
              throwPlayerBomb(w, target);
            } else {
              placePlayerBomb(w, target);
            }
          }
        } else if (msg.type === 'EMOTE_TRIGGER' && msg.emote) {
          const w = worldRef.current;
          const target =
            w.extraPlayers.find((ep) => ep.id === msg.slot) ||
            w.player2 ||
            w.extraPlayers[0];
          if (target) {
            triggerPlayerEmote(w, target, msg.emote);
          }
        }
      } catch {
        // Ignore invalid WS messages
      }
    },
    [levelIdx, loadLevelByIndex, p1Flame, p1Skin, p2Skin, roomBotCount, roomMembers, syncHud, user]
  );

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.onmessage = handleWsMessage;
    }
  }, [handleWsMessage]);

  // Connect & Handle WebSocket Room
  const ensureWsConnected = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.onmessage = handleWsMessage;
        resolve(wsRef.current);
        return;
      }
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => resolve(ws);
      ws.onmessage = handleWsMessage;
    });
  }, [handleWsMessage]);

  // Keep WebSocket connected and refresh rooms list when opening MULTI tab
  useEffect(() => {
    ensureWsConnected()
      .then((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'LIST_ROOMS' }));
        }
      })
      .catch(() => {});
    fetchPublicRooms().then(setPublicRooms);
  }, [hubTab, hubOpen, ensureWsConnected]);

  const handleRefreshRooms = useCallback(() => {
    fetchPublicRooms().then(setPublicRooms);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'LIST_ROOMS' }));
    }
  }, []);

  const handleCreateOrJoinRoom = async (
    code: string,
    botCount: number = roomBotCount,
    action: 'CREATE' | 'JOIN' | 'AUTO' = 'AUTO'
  ) => {
    setRoomNotice(null);
    const activeUser = user || getSavedUser();
    const ws = await ensureWsConnected();
    ws.send(
      JSON.stringify({
        type: 'CREATE_OR_JOIN_ROOM',
        roomCode: code,
        action,
        botCount,
        username: activeUser?.username || 'guest',
        displayName: activeUser?.displayName || 'THAY_DUOC',
        skin: activeUser?.equippedSkin || p1Skin,
        flameColor: activeUser?.equippedFlame || p1Flame,
      })
    );
  };

  const handleLeaveRoom = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'LEAVE_ROOM' }));
    }
    setRoomCode(null);
    setRoomMembers([]);
    setAssignedSlot('P1');
    assignedSlotRef.current = 'P1';
  };

  const handleChangeRoomBotCount = (nextBots: number) => {
    const clamped = Math.max(0, Math.min(3, nextBots));
    setRoomBotCount(clamped);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'CONFIGURE_ROOM',
          botCount: clamped,
        })
      );
    }
  };

  const handleStartRoomMatch = () => {
    const activeUser = user || getSavedUser();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'START_ROOM_MATCH',
          botCount: roomBotCount,
        })
      );
    } else {
      setIsBattleRoyale(true);
      loadLevelByIndex(
        levelIdx,
        1250,
        true,
        p1Skin,
        p2Skin,
        p1Flame,
        true,
        activeUser?.displayName || 'THAY_DUOC',
        roomBotCount,
        roomMembers,
        assignedSlotRef.current
      );
    }
  };

  const handleBroadcastEmote = useCallback((emote: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'EMOTE_TRIGGER', emote }));
    }
  }, []);

  const handleBroadcastPlayerSync = useCallback(
    (payload: {
      x: number;
      y: number;
      dir: Direction;
      isMoving: boolean;
      hp: number;
      isAlive: boolean;
      isGhost: boolean;
    }) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'PLAYER_SYNC',
            ...payload,
          })
        );
      }
    },
    []
  );

  const handleBroadcastBombAction = useCallback(
    (payload: { action: 'PLACE' | 'THROW'; x: number; y: number; dir: Direction }) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'BOMB_ACTION',
            ...payload,
          })
        );
      }
    },
    []
  );

  const handleToggleMute = () => {
    soundEngine.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
        const orientation = screen.orientation as ScreenOrientation & {
          lock?: (mode: string) => Promise<void>;
        };
        if (orientation?.lock) {
          await orientation.lock('landscape').catch(() => {});
        }
      } else {
        await document.exitFullscreen?.();
      }
    } catch {
      // Ignore fullscreen API restrictions on iOS Safari
    }
  };

  const handleToggleTwoPlayer = () => {
    const next2P = !isTwoPlayer;
    setIsTwoPlayer(next2P);
    setIsBattleRoyale(false);
    loadLevelByIndex(
      levelIdx,
      worldRef.current.score,
      next2P,
      p1Skin,
      p2Skin,
      p1Flame,
      false,
      user?.displayName || 'THAY_DUOC'
    );
  };

  const handleCycleP1Skin = () => {
    const nextSkin = SKIN_ORDER[(SKIN_ORDER.indexOf(p1Skin) + 1) % SKIN_ORDER.length];
    setP1Skin(nextSkin);
    worldRef.current.player.skin = nextSkin;
    syncHud();
  };

  const handleSelectP1Skin = (skin: HeroSkinId) => {
    setP1Skin(skin);
    worldRef.current.player.skin = skin;
    syncHud();
  };

  const handleSelectP2Skin = (skin: HeroSkinId) => {
    setP2Skin(skin);
    if (worldRef.current.player2) {
      worldRef.current.player2.skin = skin;
    }
    syncHud();
  };

  const handleNextLevel = () => {
    const nextIdx = (levelIdx + 1) % LEVELS.length;
    loadLevelByIndex(nextIdx, worldRef.current.score);
  };

  const handleSelectLevelCode = (code: string) => {
    const foundIdx = LEVELS.findIndex((l) => l.code === code);
    if (foundIdx !== -1 && foundIdx === levelIdx) {
      loadLevelByIndex(foundIdx, 1250);
    }
  };

  const totalCoinsDisplay = (user?.coins ?? 400) + hudState.coinsEarned;

  return (
    <main
      className={`w-full flex flex-col items-center justify-center ${
        isMobileLandscape
          ? 'h-[100dvh] overflow-hidden p-0.5'
          : 'min-h-[100dvh] p-2 sm:p-4'
      }`}
    >
      <TopHudBar
        hp={hudState.hp}
        maxHp={hudState.maxHp}
        bombsCount={hudState.bombsCount}
        fireRange={hudState.fireRange}
        speedLevel={hudState.speedLevel}
        kickTimer={hudState.kickTimer}
        throwTimer={hudState.throwTimer}
        levelCode={hudState.levelCode}
        timeRemaining={hudState.timeRemaining}
        score={hudState.score}
        coins={totalCoinsDisplay}
        userName={user?.displayName}
        isBattleRoyale={isBattleRoyale}
        isMuted={isMuted}
        isMobileLandscape={isMobileLandscape}
        showGamepad={showGamepad}
        onToggleMute={handleToggleMute}
        onToggleGamepad={() => setShowGamepad((prev) => !prev)}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenHub={(tab) => {
          setHubTab(tab);
          setHubOpen(true);
        }}
        onOpenSettings={() => setStatus((prev) => (prev === 'PAUSED' ? 'PLAYING' : 'PAUSED'))}
        onOpenLevelSelect={() => setStatus('PAUSED')}
      />

      {roomCode && isBattleRoyale && !hubOpen && (
        <div className="w-full max-w-[1140px] mb-1 px-3 py-1.5 rounded-lg bg-[#0c1629]/95 border border-sky-400/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-sky-200 font-semibold">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400 text-amber-300 font-mono-num font-bold">
              PHÒNG: {roomCode}
            </span>
            <span>
              👤 Người chơi: <strong className="text-emerald-300">{Math.max(1, roomMembers.length)}/4</strong>
            </span>
            <span>•</span>
            <span>
              🤖 BOT chơi cùng: <strong className="text-amber-300">{roomBotCount}</strong>
            </span>
            {roomMembers.length <= 1 && roomBotCount === 0 && (
              <span className="text-amber-300 animate-pulse font-bold">
                • ⏳ Đang ở 1 mình chờ người chơi khác JOIN mã {roomCode}...
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setHubTab('MULTI');
              setHubOpen(true);
            }}
            className="px-2.5 py-0.5 rounded bg-[#182949] hover:bg-[#233b69] border border-sky-400/60 text-sky-200 font-game font-bold text-[11px] cursor-pointer"
          >
            ⚙️ CHỈNH SỐ BOT / PHÒNG
          </button>
        </div>
      )}

      <GameCanvas
        worldRef={worldRef}
        status={hubOpen && status === 'PLAYING' ? 'PAUSED' : status}
        touchDir={hubOpen ? null : touchDir}
        isMobileLandscape={isMobileLandscape}
        onSyncHud={syncHud}
        onGameEnd={handleGameEnd}
        onBroadcastEmote={handleBroadcastEmote}
        onBroadcastPlayerSync={handleBroadcastPlayerSync}
        onBroadcastBombAction={handleBroadcastBombAction}
      />

      <TouchControls
        currentLevelCode={hudState.levelCode}
        isTwoPlayer={isTwoPlayer}
        isBattleRoyale={isBattleRoyale}
        p1Skin={p1Skin}
        p2Hp={hudState.p2Hp}
        kickTimer={hudState.kickTimer}
        throwTimer={hudState.throwTimer}
        activeTouchDir={touchDir}
        isMobileLandscape={isMobileLandscape}
        isPortraitMobile={isPortraitMobile}
        showGamepad={showGamepad}
        onSelectLevel={handleSelectLevelCode}
        onToggleTwoPlayer={handleToggleTwoPlayer}
        onCycleSkin={handleCycleP1Skin}
        onDirChange={setTouchDir}
        onPlaceBomb={() => {
          if (status === 'PLAYING' && !hubOpen) {
            placePlayerBomb(worldRef.current, worldRef.current.player);
            handleBroadcastBombAction({
              action: 'PLACE',
              x: worldRef.current.player.x,
              y: worldRef.current.player.y,
              dir: worldRef.current.player.dir,
            });
          }
        }}
        onThrowBomb={() => {
          if (status === 'PLAYING' && !hubOpen) {
            throwPlayerBomb(worldRef.current, worldRef.current.player);
            handleBroadcastBombAction({
              action: 'THROW',
              x: worldRef.current.player.x,
              y: worldRef.current.player.y,
              dir: worldRef.current.player.dir,
            });
          }
        }}
        onTriggerEmote={(emote) => {
          triggerPlayerEmote(worldRef.current, worldRef.current.player, emote);
          handleBroadcastEmote(emote);
        }}
        onOpenHub={(tab) => {
          setHubTab(tab);
          setHubOpen(true);
        }}
        onRestartLevel={() => loadLevelByIndex(levelIdx, 1250)}
        onToggleFullscreen={handleToggleFullscreen}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        enemiesRemaining={hudState.enemiesRemaining}
      />

      <LobbyShopModal
        isOpen={hubOpen}
        activeTab={hubTab}
        user={user}
        isBattleRoyale={isBattleRoyale}
        roomCode={roomCode}
        assignedSlot={assignedSlot}
        roomMembers={roomMembers}
        publicRooms={publicRooms}
        roomNotice={roomNotice}
        roomBotCount={roomBotCount}
        onClose={() => setHubOpen(false)}
        onChangeTab={setHubTab}
        onUserUpdated={handleUserUpdated}
        onChangeRoomBotCount={handleChangeRoomBotCount}
        onRefreshRooms={handleRefreshRooms}
        onLeaveRoom={handleLeaveRoom}
        onStartBattleRoyale={() => {
          setIsBattleRoyale(true);
          loadLevelByIndex(
            levelIdx,
            1250,
            true,
            p1Skin,
            p2Skin,
            p1Flame,
            true,
            user?.displayName || 'THAY_DUOC',
            3,
            [],
            'P1'
          );
        }}
        onStopBattleRoyale={() => {
          setIsBattleRoyale(false);
          loadLevelByIndex(
            levelIdx,
            1250,
            false,
            p1Skin,
            p2Skin,
            p1Flame,
            false,
            user?.displayName || 'THAY_DUOC',
            0,
            [],
            'P1'
          );
        }}
        onCreateOrJoinRoom={handleCreateOrJoinRoom}
        onStartRoomMatch={handleStartRoomMatch}
      />

      <GameModals
        status={status}
        currentLevelCode={hudState.levelCode}
        isTwoPlayer={isTwoPlayer}
        p1Skin={p1Skin}
        p2Skin={p2Skin}
        score={hudState.score}
        timeRemaining={hudState.timeRemaining}
        leaderboard={leaderboard}
        onResume={() => setStatus('PLAYING')}
        onRestart={() => loadLevelByIndex(levelIdx, 1250)}
        onSelectLevel={handleSelectLevelCode}
        onToggleTwoPlayer={handleToggleTwoPlayer}
        onSelectP1Skin={handleSelectP1Skin}
        onSelectP2Skin={handleSelectP2Skin}
        onNextLevel={handleNextLevel}
      />
    </main>
  );
};
