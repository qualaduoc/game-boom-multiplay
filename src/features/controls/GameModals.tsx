import React from 'react';
import { LEVELS } from '../../config/levelsConfig';
import { GameStatus, HeroSkinId, LeaderboardEntry } from '../../types/gameTypes';
import { HERO_SKINS } from '../../utils/pixelArtMatrix';

interface GameModalsProps {
  status: GameStatus;
  currentLevelCode: string;
  isTwoPlayer: boolean;
  p1Skin: HeroSkinId;
  p2Skin: HeroSkinId;
  score: number;
  timeRemaining: number;
  leaderboard: LeaderboardEntry[];
  onResume: () => void;
  onRestart: () => void;
  onSelectLevel: (code: string) => void;
  onToggleTwoPlayer: () => void;
  onSelectP1Skin: (skin: HeroSkinId) => void;
  onSelectP2Skin: (skin: HeroSkinId) => void;
  onNextLevel: () => void;
}

export const GameModals: React.FC<GameModalsProps> = ({
  status,
  currentLevelCode,
  isTwoPlayer,
  p1Skin,
  p2Skin,
  score,
  timeRemaining,
  leaderboard,
  onResume,
  onRestart,
  onSelectLevel,
  onToggleTwoPlayer,
  onSelectP1Skin,
  onSelectP2Skin,
  onNextLevel,
}) => {
  if (status === 'PLAYING') return null;

  const badgeForTier = (tier: 'EASY' | 'MEDIUM' | 'HARD') => {
    if (tier === 'EASY')
      return { text: 'DỄ', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' };
    if (tier === 'MEDIUM')
      return { text: 'TRUNG BÌNH', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/50' };
    return { text: 'KHÓ / BOSS', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/50' };
  };

  const skinList = Object.values(HERO_SKINS);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-[#0d1526] border-2 border-[#4c70a8] rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white max-h-[92vh] overflow-y-auto">
        {status === 'VICTORY' && (
          <div className="text-center space-y-4">
            <div className="inline-block px-3.5 py-1 bg-amber-500/20 border border-amber-400 rounded-lg text-amber-300 font-game font-bold text-xs">
              🏆 HOÀN THÀNH XUẤT SẮC!
            </div>
            <h2 className="font-game font-extrabold text-2xl sm:text-3xl text-amber-400">
              CHIẾN THẮNG MÀN {currentLevelCode}!
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Thầy đã chinh phục màn {currentLevelCode} với thời gian còn dư{' '}
              <strong className="text-white">{Math.ceil(timeRemaining)} giây</strong> (+Thưởng Xu vào tài khoản)!
            </p>
            <div className="bg-[#152238] border-2 border-[#3b598a] rounded-xl p-4 font-mono-num font-extrabold text-lg text-emerald-400">
              TỔNG ĐIỂM: {String(Math.floor(score)).padStart(6, '0')}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onNextLevel}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-game font-bold text-sm rounded-xl border border-emerald-200 cursor-pointer shadow-[0_4px_0_#065f46]"
              >
                MÀN TIẾP THEO ▶
              </button>
              <button
                onClick={onRestart}
                className="px-5 py-3 bg-[#1e2f4d] hover:bg-[#2a4169] text-white font-game font-bold text-sm rounded-xl border border-[#5278b5] cursor-pointer"
              >
                CHƠI LẠI
              </button>
            </div>
          </div>
        )}

        {status === 'GAME_OVER' && (
          <div className="text-center space-y-4">
            <h2 className="font-game font-extrabold text-2xl sm:text-3xl text-rose-500">
              THẤT BẠI (GAME OVER)
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Hiệp sĩ đã hết tim hoặc hết thời gian ở màn {currentLevelCode}.
            </p>
            <div className="bg-[#152238] border-2 border-[#3b598a] rounded-xl p-4 font-mono-num font-extrabold text-lg text-amber-400">
              ĐIỂM ĐẠT ĐƯỢC: {String(Math.floor(score)).padStart(6, '0')}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onRestart}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-game font-bold text-sm rounded-xl border border-white cursor-pointer shadow-[0_4px_0_#78350f]"
              >
                🔄 THỬ LẠI NGAY
              </button>
            </div>
          </div>
        )}

        {status === 'PAUSED' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#283d63] pb-3.5">
              <h2 className="font-game font-bold text-base sm:text-lg text-amber-400">
                ⚙️ CHỌN BÀN CHƠI, CHẾ ĐỘ 2P & BẢNG XẾP HẠNG
              </h2>
              <button
                onClick={onResume}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-xl font-game font-bold text-xs cursor-pointer"
              >
                ✕ ĐÓNG
              </button>
            </div>

            {/* 1. Hero Skin Shop & 2P Mode */}
            <div className="bg-[#131f36] border border-[#3b598a] rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-game font-bold text-xs sm:text-sm text-amber-300">
                  🛡️ CHỌN NHANH GIÁP HIỆP SĨ (P1 & P2):
                </span>
                <button
                  onClick={onToggleTwoPlayer}
                  className={`px-3.5 py-1.5 rounded-lg border font-game font-bold text-xs cursor-pointer ${
                    isTwoPlayer
                      ? 'bg-sky-400 text-slate-950 border-white'
                      : 'bg-[#1e2f4d] text-sky-300 border-sky-500/50'
                  }`}
                >
                  {isTwoPlayer
                    ? '👥 ĐANG BẬT: 2 NGƯỜI CHƠI (CO-OP)'
                    : '👤 BẤM ĐỂ BẬT 2 NGƯỜI CHƠI (2P)'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {skinList.map((sk) => {
                  const isP1 = p1Skin === sk.id;
                  const isP2 = isTwoPlayer && p2Skin === sk.id;
                  return (
                    <div
                      key={sk.id}
                      className={`p-3 rounded-xl border-2 flex items-center justify-between gap-2 ${
                        isP1 || isP2
                          ? 'bg-[#1e3254] border-amber-400'
                          : 'bg-[#0f192d] border-[#283d63]'
                      }`}
                    >
                      <div>
                        <div className="font-game font-bold text-sm text-white">{sk.name}</div>
                        <div className="text-xs text-emerald-300 mt-0.5">{sk.bonusDesc}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onSelectP1Skin(sk.id)}
                          className={`px-2.5 py-1 rounded-lg font-game font-bold text-xs cursor-pointer ${
                            isP1
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                          }`}
                        >
                          P1
                        </button>
                        {isTwoPlayer && (
                          <button
                            onClick={() => onSelectP2Skin(sk.id)}
                            className={`px-2.5 py-1 rounded-lg font-game font-bold text-xs cursor-pointer ${
                              isP2
                                ? 'bg-sky-400 text-slate-950'
                                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                            }`}
                          >
                            P2
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. 8 Maps Campaign Progression (Strictly Sequential - No Skipping) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-game font-bold text-xs sm:text-sm text-slate-200">
                  🗺️ HÀNH TRÌNH 8 ẢI (BẮT BUỘC VƯỢT ẢI LẦN LƯỢT TỪ 1-1):
                </p>
                <span className="text-[11px] font-semibold text-amber-300">
                  Diệt sạch quái & vào cổng EXIT để qua màn
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LEVELS.map((lv, idx) => {
                  const currentIdx = Math.max(
                    0,
                    LEVELS.findIndex((item) => item.code === currentLevelCode)
                  );
                  const active = idx === currentIdx;
                  const passed = idx < currentIdx;
                  const badge = badgeForTier(lv.difficulty);
                  return (
                    <div
                      key={lv.code}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        active
                          ? 'bg-[#1e3254] border-amber-400 text-amber-300 shadow-md'
                          : passed
                            ? 'bg-[#112428] border-emerald-500/60 text-emerald-200'
                            : 'bg-[#0f172a] border-[#243757] text-slate-500 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-game font-bold text-sm flex items-center gap-1.5">
                          <span>{passed ? '✓' : active ? '★' : '🔒'}</span>
                          <span>{lv.title}</span>
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[11px] font-game font-bold border rounded-md shrink-0 ${badge.cls}`}
                        >
                          {passed ? 'ĐÃ QUA' : active ? 'ĐANG CHƠI' : badge.text}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 line-clamp-1">{lv.subtitle}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Leaderboard */}
            <div className="space-y-2">
              <p className="font-game font-bold text-xs sm:text-sm text-slate-300">
                🏆 BẢNG XẾP HẠNG CAO THỦ:
              </p>
              <div className="bg-[#131f36] border border-[#3b598a] rounded-xl divide-y divide-[#243757] max-h-32 overflow-y-auto">
                {leaderboard.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="px-3.5 py-2 flex items-center justify-between text-xs sm:text-sm"
                  >
                    <span className="font-game font-bold text-amber-300">
                      #{idx + 1} {item.player_name}{' '}
                      <span className="text-slate-400 font-normal">(Màn {item.level_code})</span>
                    </span>
                    <span className="font-mono-num font-bold text-emerald-400">
                      {String(item.score).padStart(6, '0')} điểm
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                onClick={onRestart}
                className="px-4 py-2.5 bg-[#1e2f4d] hover:bg-[#294066] border border-[#5278b5] rounded-xl font-game font-bold text-xs sm:text-sm cursor-pointer"
              >
                🔄 CHƠI LẠI MÀN NÀY
              </button>
              <button
                onClick={onResume}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-white rounded-xl font-game font-bold text-xs sm:text-sm cursor-pointer"
              >
                TIẾP TỤC CHƠI ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
