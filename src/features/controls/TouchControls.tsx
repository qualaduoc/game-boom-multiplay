import React, { useRef, useState } from 'react';
import { LEVELS } from '../../config/levelsConfig';
import { PIXEL_EMOTES } from '../../constants/gameConstants';
import { Direction, HeroSkinId } from '../../types/gameTypes';

interface TouchControlsProps {
  currentLevelCode: string;
  isTwoPlayer: boolean;
  isBattleRoyale?: boolean;
  p1Skin: HeroSkinId;
  p2Hp?: number;
  kickTimer: number;
  throwTimer: number;
  activeTouchDir: Direction | null;
  isMobileLandscape: boolean;
  isPortraitMobile: boolean;
  showGamepad: boolean;
  onSelectLevel: (code: string) => void;
  onToggleTwoPlayer: () => void;
  onCycleSkin: () => void;
  onDirChange: (dir: Direction | null) => void;
  onPlaceBomb: () => void;
  onThrowBomb: () => void;
  onTriggerEmote: (emote: string) => void;
  onOpenHub: (tab: 'AUTH' | 'SHOP' | 'MULTI') => void;
  onRestartLevel: () => void;
  onToggleFullscreen: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  enemiesRemaining: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  currentLevelCode,
  isTwoPlayer,
  isBattleRoyale = false,
  p2Hp,
  kickTimer,
  throwTimer,
  activeTouchDir,
  isMobileLandscape,
  isPortraitMobile,
  showGamepad,
  onToggleTwoPlayer,
  onDirChange,
  onPlaceBomb,
  onThrowBomb,
  onTriggerEmote,
  onOpenHub,
  onRestartLevel,
  onToggleFullscreen,
  enemiesRemaining,
}) => {
  const dpadRef = useRef<HTMLDivElement | null>(null);
  const lastDirRef = useRef<Direction | null>(null);
  const [dismissedPortraitHint, setDismissedPortraitHint] = useState(false);

  const currentStageIdx = Math.max(
    0,
    LEVELS.findIndex((lv) => lv.code === currentLevelCode)
  );

  const vibrate = (ms: number = 10) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch {
      // Ignore vibration errors on unsupported browsers
    }
  };

  const resolveDirectionFromPoint = (clientX: number, clientY: number): Direction | null => {
    const el = dpadRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < 10) return null;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'RIGHT' : 'LEFT';
    }
    return dy > 0 ? 'DOWN' : 'UP';
  };

  const handleDpadPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const dir = resolveDirectionFromPoint(e.clientX, e.clientY);
    if (dir !== lastDirRef.current) {
      lastDirRef.current = dir;
      vibrate(8);
      onDirChange(dir);
    }
  };

  const handleDpadPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0 && e.pressure === 0) return;
    e.preventDefault();
    const dir = resolveDirectionFromPoint(e.clientX, e.clientY);
    if (dir !== lastDirRef.current) {
      lastDirRef.current = dir;
      vibrate(6);
      onDirChange(dir);
    }
  };

  const handleDpadPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    lastDirRef.current = null;
    onDirChange(null);
  };

  return (
    <>
      {/* 1. Portrait Smartphone Prompt: Recommend Landscape + 1-Tap Fullscreen Lock */}
      {isPortraitMobile && !dismissedPortraitHint && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-sm bg-[#0b1324] border-2 border-amber-400 rounded-2xl p-6 text-center shadow-[0_0_35px_rgba(251,191,36,0.35)] space-y-4">
            <div className="text-4xl animate-bounce">📱🔄</div>
            <h2 className="font-game font-bold text-base sm:text-lg text-amber-400 leading-snug">
              XOAY NGANG ĐIỆN THOẠI ĐỂ CHƠI TỐT NHẤT!
            </h2>
            <p className="text-slate-200 text-sm leading-relaxed">
              Game được tối ưu chuẩn <strong className="text-amber-300">Màn Hình Ngang (Landscape)</strong> với cụm{' '}
              <strong className="text-sky-300">D-Pad Trượt Đa Hướng</strong> bên trái và{' '}
              <strong className="text-amber-300">Nút Đặt / Ném Bom</strong> bên phải.
            </p>
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={() => {
                  onToggleFullscreen();
                  setDismissedPortraitHint(true);
                }}
                className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 active:translate-y-0.5 text-slate-950 font-game font-bold text-sm rounded-xl border-2 border-white shadow-[0_4px_0_#92400e] cursor-pointer"
              >
                ⛶ BẬT TOÀN MÀN HÌNH & XOAY NGANG
              </button>
              <button
                onClick={() => setDismissedPortraitHint(true)}
                className="w-full py-2.5 px-4 bg-[#162642] hover:bg-[#1e3254] text-slate-200 font-game font-semibold text-xs rounded-xl border border-[#47689b] cursor-pointer"
              >
                TIẾP TỤC CHƠI NGAY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Split-Thumb Handheld Gamepad Overlay (Active on Smartphone Landscape or when Gamepad toggled) */}
      {(showGamepad || isMobileLandscape) && (
        <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden">
          {/* LEFT THUMB ZONE: Slide-Touch Cross D-Pad (152x152px) */}
          <div
            ref={dpadRef}
            onPointerDown={handleDpadPointerDown}
            onPointerMove={handleDpadPointerMove}
            onPointerUp={handleDpadPointerEnd}
            onPointerCancel={handleDpadPointerEnd}
            style={{
              touchAction: 'none',
              left: 'max(12px, env(safe-area-inset-left, 12px))',
              bottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
            }}
            className="pointer-events-auto fixed w-[148px] h-[148px] sm:w-[160px] sm:h-[160px] rounded-full bg-[#0b1324]/75 backdrop-blur-xs border-2 border-[#3b598a]/80 shadow-[0_8px_24px_rgba(0,0,0,0.65)] flex items-center justify-center"
          >
            {/* UP Button */}
            <div
              className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-t-xl border-2 flex items-center justify-center text-base transition-transform ${
                activeTouchDir === 'UP'
                  ? 'bg-amber-400 text-slate-950 border-white scale-105 shadow-[0_0_12px_rgba(251,191,36,0.85)]'
                  : 'bg-[#162642]/90 text-white border-[#47689b]'
              }`}
            >
              ▲
            </div>

            {/* DOWN Button */}
            <div
              className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-b-xl border-2 flex items-center justify-center text-base transition-transform ${
                activeTouchDir === 'DOWN'
                  ? 'bg-amber-400 text-slate-950 border-white scale-105 shadow-[0_0_12px_rgba(251,191,36,0.85)]'
                  : 'bg-[#162642]/90 text-white border-[#47689b]'
              }`}
            >
              ▼
            </div>

            {/* LEFT Button */}
            <div
              className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-l-xl border-2 flex items-center justify-center text-base transition-transform ${
                activeTouchDir === 'LEFT'
                  ? 'bg-amber-400 text-slate-950 border-white scale-105 shadow-[0_0_12px_rgba(251,191,36,0.85)]'
                  : 'bg-[#162642]/90 text-white border-[#47689b]'
              }`}
            >
              ◀
            </div>

            {/* RIGHT Button */}
            <div
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-r-xl border-2 flex items-center justify-center text-base transition-transform ${
                activeTouchDir === 'RIGHT'
                  ? 'bg-amber-400 text-slate-950 border-white scale-105 shadow-[0_0_12px_rgba(251,191,36,0.85)]'
                  : 'bg-[#162642]/90 text-white border-[#47689b]'
              }`}
            >
              ▶
            </div>

            {/* Center Pivot Hub */}
            <div className="w-9 h-9 rounded-full bg-[#0f1b33] border border-[#3b598a] flex items-center justify-center text-xs text-amber-300/80">
              ✥
            </div>
          </div>

          {/* RIGHT THUMB ZONE: Ergonomic Arcade Action Buttons + Quick Emote/Shop Bar */}
          <div
            style={{
              touchAction: 'none',
              right: 'max(12px, env(safe-area-inset-right, 12px))',
              bottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
            }}
            className="pointer-events-auto fixed flex flex-col items-end gap-2"
          >
            {/* Quick Emotes Strip on Mobile */}
            <div className="flex items-center gap-1 bg-[#0b1324]/85 backdrop-blur-xs border border-[#3b598a] rounded-full px-2 py-0.5 shadow-lg">
              {PIXEL_EMOTES.map((emote) => (
                <button
                  key={emote}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    vibrate(8);
                    onTriggerEmote(emote);
                  }}
                  className="w-7 h-7 rounded-full hover:bg-[#1e3254] flex items-center justify-center text-sm cursor-pointer"
                >
                  {emote}
                </button>
              ))}
            </div>

            {/* Mini Utility Strip: Sequential Stage Indicator, Shop, 4P Battle, Restart */}
            <div className="flex items-center gap-1.5 bg-[#0b1324]/85 backdrop-blur-xs border border-[#3b598a] rounded-full px-2.5 py-1 shadow-lg">
              <span className="px-2.5 py-1 rounded-full bg-[#162642] border border-amber-400/70 font-game font-bold text-[11px] text-amber-300">
                🗺️ ẢI {currentLevelCode} ({currentStageIdx + 1}/{LEVELS.length})
              </span>

              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  vibrate(10);
                  onOpenHub('SHOP');
                }}
                className="px-2.5 py-1 rounded-full bg-[#162642] border border-sky-400/60 font-game font-bold text-[11px] text-sky-300 cursor-pointer"
              >
                🛒 SHOP
              </button>

              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  vibrate(10);
                  onOpenHub('MULTI');
                }}
                className="px-2.5 py-1 rounded-full bg-[#162642] border border-rose-400/60 font-game font-bold text-[11px] text-rose-300 cursor-pointer"
              >
                ⚔️ 4P
              </button>

              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  vibrate(12);
                  onRestartLevel();
                }}
                className="px-2.5 py-1 rounded-full bg-[#162642] border border-slate-500 font-game font-bold text-[11px] text-slate-200 cursor-pointer"
              >
                🔄
              </button>
            </div>

            {/* Dual Arcade Buttons (B: Throw Bomb, A: Place Bomb) */}
            <div className="flex items-end gap-3 pr-1">
              {/* Button B: Throw Bomb (Locked until THROW_GLOVE picked up!) */}
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  vibrate(14);
                  onThrowBomb();
                }}
                style={{ touchAction: 'none' }}
                className={`w-[60px] h-[60px] sm:w-[66px] sm:h-[66px] rounded-full active:scale-95 border-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  throwTimer > 0
                    ? 'bg-sky-500/95 active:bg-sky-300 border-sky-100 shadow-[0_5px_0_#0369a1,0_0_16px_rgba(56,189,248,0.8)]'
                    : 'bg-slate-800/85 border-slate-500/80 opacity-80 shadow-[0_4px_0_#0f172a]'
                }`}
              >
                <span className="text-lg leading-none">{throwTimer > 0 ? '🥊' : '🔒'}</span>
                <span
                  className={`font-game font-bold text-[11px] mt-0.5 ${
                    throwTimer > 0 ? 'text-slate-950' : 'text-slate-300'
                  }`}
                >
                  {throwTimer > 0 ? `${Math.ceil(throwTimer)}s` : 'NÉM'}
                </span>
              </button>

              {/* Button A: Place Bomb (72x72px Primary CTA) */}
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  vibrate(18);
                  onPlaceBomb();
                }}
                style={{ touchAction: 'none' }}
                className="w-[72px] h-[72px] sm:w-[78px] sm:h-[78px] -translate-y-2 rounded-full bg-amber-400/95 active:bg-amber-300 active:scale-95 border-3 border-white shadow-[0_6px_0_#92400e,0_10px_24px_rgba(0,0,0,0.75)] flex flex-col items-center justify-center cursor-pointer transition-transform"
              >
                <span className="text-2xl leading-none">💣</span>
                <span className="font-game font-extrabold text-xs text-slate-950 mt-0.5">
                  ĐẶT BOM
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Desktop & Tablet Scientific Command Deck (2 Symmetrical Tiers - Sequential Progression Only) */}
      {!isMobileLandscape && (
        <section className="w-full max-w-[872px] mt-2 bg-[#0b1324] border-2 border-[#2b426b] rounded-xl px-3.5 py-2.5 space-y-2 select-none shadow-[0_10px_28px_rgba(0,0,0,0.7)]">
          {/* TIER 1: Sequential Campaign Progress Stepper (Left) + Mission & Timed Buff Telemetry (Right) */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2f4d] pb-2">
            {/* Left: Non-clickable Sequential Stage Stepper (Phải chơi lần lượt!) */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-game font-bold text-[11px] text-slate-300 mr-1 flex items-center gap-1">
                <span>🗺️</span>
                <span>TIẾN TRÌNH ẢI:</span>
              </span>
              {LEVELS.map((lv, idx) => {
                const isPassed = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div
                    key={lv.code}
                    title={
                      isCurrent
                        ? `Đang chiến đấu tại ${lv.title}`
                        : isPassed
                          ? `Đã vượt qua ${lv.title}`
                          : `🔒 Khóa — Phải vượt qua màn trước theo thứ tự!`
                    }
                    className={`px-2 py-0.5 rounded-md border font-game font-bold text-[11px] flex items-center gap-1 transition-all ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_10px_rgba(251,191,36,0.55)]'
                        : isPassed
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                          : 'bg-[#0f192d] text-slate-500 border-[#243757] opacity-75'
                    }`}
                  >
                    <span>{isPassed ? '✓' : isCurrent ? '★' : '🔒'}</span>
                    <span>{lv.code === '3-2' ? '3-2 BOSS' : lv.code}</span>
                  </div>
                );
              })}
            </div>

            {/* Right: Mission Target & Timed Item Buffs */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 bg-[#131f36] border border-[#3b598a] rounded-lg px-2.5 py-1 text-[11px]">
                <span
                  className={
                    kickTimer > 0 ? 'text-emerald-300 font-bold' : 'text-slate-400 font-medium'
                  }
                >
                  {kickTimer > 0 ? `👟 Đá: ${Math.ceil(kickTimer)}s` : '👟 Đá: Ăn Giày'}
                </span>
                <span className="text-slate-600">•</span>
                <span
                  className={
                    throwTimer > 0 ? 'text-sky-300 font-bold' : 'text-slate-400 font-medium'
                  }
                >
                  {throwTimer > 0 ? `🥊 Ném: ${Math.ceil(throwTimer)}s` : '🥊 Ném: Ăn Găng'}
                </span>
              </div>

              <div
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-game font-bold border ${
                  enemiesRemaining === 0
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 animate-pulse'
                    : 'bg-[#131f36] border-amber-400/60 text-amber-300'
                }`}
              >
                <span>
                  {enemiesRemaining === 0
                    ? '✨ CỔNG EXIT ĐÃ MỞ!'
                    : `🎯 DIỆT QUÁI: CÒN ${enemiesRemaining}`}
                </span>
              </div>
            </div>
          </div>

          {/* TIER 2: 3-Zone Scientific Command Bar (Left: Combat Pad | Center: Quick Emotes | Right: Modes & Hub) */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* ZONE 1 (LEFT): Primary Combat Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onPlaceBomb}
                title="Đặt Bom (Phím Space hoặc J)"
                className="px-3.5 h-9 bg-amber-400 hover:bg-amber-300 active:translate-y-0.5 text-slate-950 border border-white rounded-lg font-game font-extrabold text-xs cursor-pointer shadow-[0_3px_0_#92400e] flex items-center gap-1.5 transition-all"
              >
                <span>💣</span>
                <span>ĐẶT BOM</span>
              </button>

              <button
                onClick={onThrowBomb}
                title="Ném Bom (Phím K hoặc G — Cần ăn Găng Ném Bom)"
                className={`px-3 h-9 active:translate-y-0.5 border rounded-lg font-game font-bold text-xs cursor-pointer flex items-center gap-1 transition-all ${
                  throwTimer > 0
                    ? 'bg-sky-400 text-slate-950 border-white shadow-[0_3px_0_#0369a1]'
                    : 'bg-[#131f36] text-slate-400 border-[#2b426b] hover:border-[#3b598a]'
                }`}
              >
                <span>{throwTimer > 0 ? '🥊' : '🔒'}</span>
                <span>{throwTimer > 0 ? `NÉM (${Math.ceil(throwTimer)}s)` : 'NÉM (K)'}</span>
              </button>

              <button
                onClick={onRestartLevel}
                title="Chơi lại màn hiện tại từ đầu"
                className="px-3 h-9 bg-[#131f36] hover:bg-[#1e3254] active:translate-y-0.5 border border-[#3b598a] rounded-lg font-game font-bold text-xs text-slate-200 hover:text-white cursor-pointer flex items-center gap-1 transition-all"
              >
                <span>🔄</span>
                <span>CHƠI LẠI</span>
              </button>
            </div>

            {/* ZONE 2 (CENTER): Quick Emote Wheel (Keys 1-4) */}
            <div className="flex items-center gap-1 bg-[#131f36] border border-[#2b426b] rounded-lg px-2.5 h-9">
              <span className="font-game font-bold text-[11px] text-sky-300 mr-1">
                BIỂU CẢM (1-4):
              </span>
              {PIXEL_EMOTES.map((emote, idx) => (
                <button
                  key={emote}
                  onClick={() => onTriggerEmote(emote)}
                  title={`Bấm phím ${idx + 1} để thả biểu cảm ${emote}`}
                  className="w-7 h-7 bg-[#1e2f4d] hover:bg-amber-400 hover:text-slate-950 rounded-md flex items-center justify-center text-sm cursor-pointer transition-colors"
                >
                  {emote}
                </button>
              ))}
            </div>

            {/* ZONE 3 (RIGHT): Game Modes & Account/Shop Hub */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenHub('MULTI')}
                className={`px-3 h-9 rounded-lg border font-game font-bold text-xs cursor-pointer transition-all flex items-center gap-1 ${
                  isBattleRoyale
                    ? 'bg-rose-600 text-white border-white shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                    : 'bg-[#131f36] hover:bg-[#1e3254] border-rose-400/70 text-rose-300'
                }`}
              >
                <span>⚔️</span>
                <span>{isBattleRoyale ? 'ĐANG ĐẤU 4P' : 'ĐẤU 4P'}</span>
              </button>

              <button
                onClick={onToggleTwoPlayer}
                className={`px-3 h-9 rounded-lg border font-game font-bold text-xs cursor-pointer transition-all flex items-center gap-1 ${
                  isTwoPlayer && !isBattleRoyale
                    ? 'bg-sky-400 text-slate-950 border-white'
                    : 'bg-[#131f36] hover:bg-[#1e3254] border-[#3b598a] text-sky-300'
                }`}
              >
                <span>👥</span>
                <span>{isTwoPlayer && !isBattleRoyale ? `2P (${p2Hp ?? 3}❤️)` : '1P / 2P'}</span>
              </button>

              <button
                onClick={() => onOpenHub('SHOP')}
                className="px-3 h-9 rounded-lg border border-amber-400 bg-amber-400/15 hover:bg-amber-400/25 font-game font-bold text-xs text-amber-300 cursor-pointer flex items-center gap-1 transition-all"
              >
                <span>🛒</span>
                <span>SHOP XU</span>
              </button>

              <button
                onClick={() => onOpenHub('AUTH')}
                className="px-3 h-9 rounded-lg border border-emerald-400/70 bg-[#131f36] hover:bg-[#1e3254] font-game font-bold text-xs text-emerald-300 cursor-pointer flex items-center gap-1 transition-all"
              >
                <span>👤</span>
                <span>TÀI KHOẢN</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
