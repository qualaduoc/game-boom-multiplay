import React from 'react';

interface TopHudBarProps {
  hp: number;
  maxHp: number;
  bombsCount: number;
  fireRange: number;
  speedLevel: number;
  kickTimer: number;
  throwTimer: number;
  levelCode: string;
  timeRemaining: number;
  score: number;
  coins: number;
  userName?: string;
  isBattleRoyale?: boolean;
  isMuted: boolean;
  isMobileLandscape: boolean;
  showGamepad: boolean;
  onToggleMute: () => void;
  onToggleGamepad: () => void;
  onToggleFullscreen: () => void;
  onOpenHub: (tab: 'AUTH' | 'SHOP' | 'MULTI') => void;
  onOpenSettings: () => void;
  onOpenLevelSelect: () => void;
}

export const PixelCoinSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" className={`${className} shrink-0`} style={{ shapeRendering: 'crispEdges' }}>
    <path d="M5 1h6v1h2v2h1v8h-1v2h-2v1H5v-1H3v-2H2V4h1V2h2V1z" fill="#78350f" />
    <path d="M5 2h6v1h2v2h1v6h-1v2h-2v1H5v-1H3v-2H2V5h1V3h2V2z" fill="#f59e0b" />
    <path d="M5 3h6v1h1v8h-1v1H5v-1H4V4h1V3z" fill="#fbbf24" />
    <rect x="6" y="4" width="2" height="6" fill="#fef08a" />
    <rect x="8" y="5" width="2" height="6" fill="#d97706" />
  </svg>
);

export const TopHudBar: React.FC<TopHudBarProps> = ({
  hp,
  maxHp,
  bombsCount,
  fireRange,
  speedLevel,
  kickTimer,
  throwTimer,
  levelCode,
  timeRemaining,
  score,
  coins,
  userName,
  isBattleRoyale = false,
  isMuted,
  isMobileLandscape,
  showGamepad,
  onToggleMute,
  onToggleGamepad,
  onToggleFullscreen,
  onOpenHub,
  onOpenSettings,
  onOpenLevelSelect,
}) => {
  const formatTime = (sec: number): string => {
    const total = Math.max(0, Math.ceil(sec));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formattedScore = String(Math.floor(score)).padStart(6, '0');

  return (
    <header
      className={`w-full max-w-[872px] bg-[#0b1324] border-2 border-[#2b426b] rounded-t-xl select-none shrink-0 overflow-hidden ${
        isMobileLandscape
          ? 'px-2 py-0.5 shadow-md'
          : 'px-3 py-2 shadow-[0_6px_0_#050912]'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* LEFT CLUSTER: Hero Avatar + Hearts + Compact Power-up Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Hero Portrait + 3 Pixel Hearts */}
          <div
            className={`flex items-center gap-1.5 bg-[#131f36] border border-[#3b598a] rounded-lg shadow-inner ${
              isMobileLandscape ? 'px-1.5 py-0.5' : 'px-2 py-1 border-2'
            }`}
          >
            <div
              className={`${
                isMobileLandscape ? 'w-6 h-6' : 'w-9 h-9'
              } bg-[#1e2f4d] border border-[#5278b5] rounded flex items-center justify-center overflow-hidden shrink-0`}
            >
              <svg
                viewBox="0 0 16 16"
                className={isMobileLandscape ? 'w-5 h-5' : 'w-8 h-8'}
                style={{ shapeRendering: 'crispEdges' }}
              >
                <path d="M3 2h10v2H14v4h-1V6H3v2H2V4h1V2z" fill="#432312" />
                <path d="M4 3h8v3H4V3zm-1 2h2v3H3V5zm9 0h2v3h-2V5z" fill="#7c472b" />
                <path d="M5 3h6v1H5V3z" fill="#9c5c39" />
                <path d="M4 6h8v6H4V6z" fill="#fbd3b0" />
                <rect x="5" y="8" width="2" height="2" fill="#111827" />
                <rect x="9" y="8" width="2" height="2" fill="#111827" />
                <rect x="5" y="8" width="1" height="1" fill="#ffffff" />
                <rect x="9" y="8" width="1" height="1" fill="#ffffff" />
                <path d="M2 12h12v3H2v-3z" fill="#dc2626" />
                <path d="M5 13h6v3H5v-3z" fill="#2563eb" />
              </svg>
            </div>

            <div className="flex items-center gap-0.5 pr-0.5">
              {Array.from({ length: maxHp }).map((_, idx) => {
                const active = idx < hp;
                return (
                  <svg
                    key={idx}
                    viewBox="0 0 14 13"
                    className={`${
                      isMobileLandscape ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'
                    } transition-transform duration-200 ${
                      active ? 'scale-100' : 'opacity-30 scale-90'
                    }`}
                    style={{ shapeRendering: 'crispEdges' }}
                  >
                    <path
                      d="M2 1h4v1h2V1h4v1h1v1h1v4h-1v2h-1v1h-1v1H9v1H8v1H6v-1H5v-1H3v-1H2V9H1V7H0V3h1V2h1V1z"
                      fill="#2b0909"
                    />
                    <path
                      d="M2 2h4v1h2V2h4v1h1v4h-1v2h-1v1H9v1H8v1H6v-1H5v-1H3V9H2V7H1V3h1V2z"
                      fill={active ? '#ef4444' : '#334155'}
                    />
                    {active && <rect x="3" y="3" width="2" height="2" fill="#fecaca" />}
                  </svg>
                );
              })}
            </div>
          </div>

          {/* Unified Power-up Pill (Bombs, Fire, Speed + Active Timed Buffs) */}
          <div
            className={`flex items-center divide-x divide-[#283d63] bg-[#131f36] border border-[#3b598a] rounded-lg ${
              isMobileLandscape ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1.5 border-2 text-sm'
            }`}
          >
            {/* Bomb */}
            <div className="flex items-center gap-1 pr-2" title="Số bom tối đa đặt cùng lúc">
              <svg viewBox="0 0 16 16" className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ shapeRendering: 'crispEdges' }}>
                <rect x="8" y="1" width="2" height="2" fill="#f97316" />
                <rect x="10" y="0" width="2" height="2" fill="#fde047" />
                <rect x="6" y="3" width="4" height="2" fill="#94a3b8" />
                <path d="M4 5h8v2h2v6h-2v2H4v-2H2V7h2V5z" fill="#1e1b4b" />
                <path d="M5 6h6v1h2v5h-2v1H5v-1H3V7h2V6z" fill="#312e81" />
                <rect x="5" y="7" width="2" height="2" fill="#a5b4fc" />
              </svg>
              <span className="font-mono-num font-bold text-white">×{bombsCount}</span>
            </div>

            {/* Fire */}
            <div className="flex items-center gap-1 px-2" title="Tầm nổ của lửa bom">
              <svg viewBox="0 0 16 16" className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ shapeRendering: 'crispEdges' }}>
                <path d="M7 1h2v2h2v3h2v5h-1v2h-2v2H6v-2H4v-2H3V6h2V4h2V1z" fill="#ea580c" />
                <path d="M7 4h2v2h2v5h-2v2H7v-2H5V6h2V4z" fill="#f97316" />
                <path d="M7 7h2v5H7V7zm-1 2h4v3H6V9z" fill="#facc15" />
              </svg>
              <span className="font-mono-num font-bold text-white">×{fireRange}</span>
            </div>

            {/* Speed */}
            <div className="flex items-center gap-1 pl-2" title="Cấp tốc độ chạy">
              <svg viewBox="0 0 16 16" className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ shapeRendering: 'crispEdges' }}>
                <path d="M4 2h6v6h4v5H2V9h2V2z" fill="#451a03" />
                <path d="M5 3h4v6h4v3H3V9h2V3z" fill="#b45309" />
                <rect x="5" y="4" width="4" height="2" fill="#f59e0b" />
              </svg>
              <span className="font-mono-num font-bold text-white">×{speedLevel}</span>
            </div>

            {kickTimer > 0 && (
              <div className="flex items-center gap-1 pl-2 text-emerald-300 font-mono-num font-bold animate-pulse">
                <span>👟{Math.ceil(kickTimer)}s</span>
              </div>
            )}

            {throwTimer > 0 && (
              <div className="flex items-center gap-1 pl-2 text-sky-300 font-mono-num font-bold animate-pulse">
                <span>🥊{Math.ceil(throwTimer)}s</span>
              </div>
            )}
          </div>
        </div>

        {/* CENTER/RIGHT CLUSTER: MÀN, GIỜ, ĐIỂM, SHOP XU, 4P & TOOLS */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* LEVEL Box */}
          <button
            onClick={onOpenLevelSelect}
            title="Nhấn để chọn màn chơi (1-1 đến 3-2)"
            className={`bg-[#131f36] hover:bg-[#1c2e4f] border border-[#3b598a] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isMobileLandscape ? 'px-2 py-0.5' : 'px-2.5 py-1 border-2 min-w-[60px]'
            }`}
          >
            <span className="font-game font-bold text-[10px] text-slate-300 leading-none">MÀN</span>
            <span className="font-mono-num font-extrabold text-amber-400 text-xs sm:text-sm leading-tight mt-0.5">
              {levelCode}
            </span>
          </button>

          {/* TIME Box */}
          <div
            className={`bg-[#131f36] border border-[#3b598a] rounded-lg flex flex-col items-center justify-center ${
              isMobileLandscape ? 'px-2 py-0.5' : 'px-2.5 py-1 border-2 min-w-[68px]'
            }`}
          >
            <span className="font-game font-bold text-[10px] text-slate-300 leading-none">THỜI GIAN</span>
            <span
              className={`font-mono-num font-extrabold tabular-nums text-xs sm:text-sm leading-tight mt-0.5 ${
                timeRemaining <= 45 ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* SCORE Box (Hidden on ultra-small mobile to save width) */}
          <div
            className={`hidden sm:flex bg-[#131f36] border-2 border-[#3b598a] rounded-lg flex-col items-center justify-center px-2.5 py-1 min-w-[78px]`}
          >
            <span className="font-game font-bold text-[10px] text-slate-300 leading-none">ĐIỂM SỐ</span>
            <span className="font-mono-num font-extrabold text-white tabular-nums text-sm leading-tight mt-0.5">
              {formattedScore}
            </span>
          </div>

          {/* COIN SHOP & ACCOUNT BUTTON (With Custom Vector Coin Icon - No Broken Unicode!) */}
          <button
            onClick={() => onOpenHub('SHOP')}
            title="Mở Cửa Hàng Xu (Mua Giáp, Màu Lửa Bom) & Tài Khoản"
            className={`bg-gradient-to-b from-[#1e2f4d] to-[#131f36] hover:from-[#263c63] hover:to-[#1a2b4a] border border-amber-400 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm ${
              isMobileLandscape ? 'px-2 py-0.5' : 'px-2.5 py-1 border-2 min-w-[82px]'
            }`}
          >
            <span className="font-game font-bold text-[10px] text-amber-200 leading-none truncate max-w-[78px]">
              {userName || 'TÀI KHOẢN'}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <PixelCoinSvg className="w-3.5 h-3.5" />
              <span className="font-mono-num font-extrabold text-amber-400 text-xs sm:text-sm leading-tight">
                {coins}
              </span>
            </div>
          </button>

          {/* 4-PLAYER BATTLE ROYALE BUTTON */}
          <button
            onClick={() => onOpenHub('MULTI')}
            title="Phòng Online 2-4 Người & Đấu Trường Sinh Tồn 4P"
            className={`${
              isMobileLandscape ? 'px-2 h-8 text-xs' : 'px-2.5 h-10 text-xs sm:text-sm border-2'
            } rounded-lg border flex items-center justify-center gap-1 cursor-pointer font-game font-bold transition-all ${
              isBattleRoyale
                ? 'bg-rose-600 text-white border-white shadow-[0_0_10px_rgba(244,63,94,0.7)]'
                : 'bg-[#131f36] hover:bg-[#1e3254] border-sky-400/80 text-sky-300'
            }`}
          >
            <span>⚔️</span>
            <span>4P</span>
          </button>

          {/* Toggle Floating Gamepad Button */}
          <button
            onClick={onToggleGamepad}
            title="Bật/Tắt Tay Cầm Ảo Màn Hình Ngang"
            className={`${
              isMobileLandscape ? 'w-8 h-8 text-xs' : 'w-9 h-10 text-sm border-2'
            } rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
              showGamepad
                ? 'bg-amber-400 text-slate-950 border-white font-bold'
                : 'bg-[#131f36] hover:bg-[#1e3254] border-[#3b598a] text-slate-200'
            }`}
          >
            🎮
          </button>

          {/* Toggle Fullscreen Button */}
          <button
            onClick={onToggleFullscreen}
            title="Toàn màn hình & Khóa xoay ngang"
            className={`${
              isMobileLandscape ? 'w-8 h-8 text-xs' : 'w-9 h-10 text-sm border-2'
            } bg-[#131f36] hover:bg-[#1e3254] border border-[#3b598a] rounded-lg flex items-center justify-center cursor-pointer text-sky-300 font-bold transition-all`}
          >
            ⛶
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Cài đặt / Đổi màn / Bảng xếp hạng"
            className={`${
              isMobileLandscape ? 'w-8 h-8' : 'w-9 h-10 border-2'
            } bg-[#131f36] hover:bg-[#1e3254] active:translate-y-0.5 border border-[#3b598a] rounded-lg flex items-center justify-center cursor-pointer transition-all`}
          >
            <svg viewBox="0 0 16 16" className="w-5 h-5" style={{ shapeRendering: 'crispEdges' }}>
              <path
                d="M6 1h4v2h2v1h1v2h2v4h-2v2h-1v1h-2v2H6v-2H4v-1H3v-2H1V6h2V4h1V3h2V1zm1 5v4h2V6H7z"
                fill="#cbd5e1"
              />
              <rect x="6" y="6" width="4" height="4" fill="#131f36" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
