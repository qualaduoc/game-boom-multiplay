import React, { useState } from 'react';
import { LEVELS } from '../../config/levelsConfig';
import { FLAME_PALETTES, rollFunnyNickname } from '../../constants/gameConstants';
import {
  buyOrEquipItem,
  loginAccount,
  PublicRoomSummary,
  quickPlayGuest,
  registerAccount,
  saveUserLocal,
} from '../../services/authShopService';
import {
  FlameColorId,
  HeroSkinId,
  PlayerSlotId,
  UserProfile,
} from '../../types/gameTypes';
import { HERO_SKINS } from '../../utils/pixelArtMatrix';
import { PixelCoinSvg } from '../hud/TopHudBar';
import {
  ChibiBomberBoySvg,
  ChibiBomberGirlSvg,
  CrossedSwordsSvg,
  CuteBlueSlimeSvg,
  Dice3DSvg,
  GiftBoxSvg,
  GlowingShieldSvg,
  GoldCoinsStackSvg,
  GoldenKeySvg,
  GoldenTrophySvg,
  GreenCubeMascotSvg,
  RunningHeroIconSvg,
  TreasureMapSvg,
  WallTorchSvg,
} from './LoginSceneArtwork';

export type HubTab = 'AUTH' | 'SHOP' | 'MULTI' | 'MAPS';

export interface RoomMemberInfo {
  slot: string;
  username?: string;
  displayName: string;
  skin: HeroSkinId;
  flameColor: FlameColorId;
}

interface LobbyShopModalProps {
  isOpen: boolean;
  activeTab: HubTab;
  user: UserProfile | null;
  isBattleRoyale: boolean;
  roomCode: string | null;
  assignedSlot: PlayerSlotId;
  roomMembers: RoomMemberInfo[];
  publicRooms: PublicRoomSummary[];
  roomNotice: { text: string; isError?: boolean } | null;
  roomBotCount: number;
  onClose: () => void;
  onChangeTab: (tab: HubTab) => void;
  onUserUpdated: (user: UserProfile | null) => void;
  onChangeRoomBotCount: (count: number) => void;
  onRefreshRooms: () => void;
  onLeaveRoom: () => void;
  onStartBattleRoyale: () => void;
  onStopBattleRoyale: () => void;
  onCreateOrJoinRoom: (
    code: string,
    botCount?: number,
    action?: 'CREATE' | 'JOIN' | 'AUTO'
  ) => void;
  onStartRoomMatch: () => void;
}

const SKIN_PRICES: Record<HeroSkinId, number> = {
  KNIGHT_RED: 0,
  PALADIN_GOLD: 250,
  SHADOW_NINJA: 350,
  ARCANE_MAGE: 450,
};

const SKIN_LIST: HeroSkinId[] = ['KNIGHT_RED', 'PALADIN_GOLD', 'SHADOW_NINJA', 'ARCANE_MAGE'];
const FLAME_LIST: FlameColorId[] = [
  'CLASSIC_ORANGE',
  'ICE_BLUE',
  'SHADOW_PURPLE',
  'EMERALD_TOXIC',
  'GOLDEN_SUN',
];

export const LobbyShopModal: React.FC<LobbyShopModalProps> = ({
  isOpen,
  activeTab,
  user,
  isBattleRoyale,
  roomCode,
  assignedSlot,
  roomMembers,
  publicRooms,
  roomNotice,
  roomBotCount,
  onClose,
  onChangeTab,
  onUserUpdated,
  onChangeRoomBotCount,
  onRefreshRooms,
  onLeaveRoom,
  onStartBattleRoyale,
  onStopBattleRoyale,
  onCreateOrJoinRoom,
  onStartRoomMatch,
}) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [guestFunnyName, setGuestFunnyName] = useState<string>(() => rollFunnyNickname());
  const [registerNick, setRegisterNick] = useState<string>('');
  const [roomInput, setRoomInput] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleQuickGuest = async (e?: React.FormEvent, forceRandom: boolean = false) => {
    if (e) e.preventDefault();
    setBusy(true);
    setFeedback(null);
    const chosenNick = forceRandom
      ? rollFunnyNickname(guestFunnyName)
      : guestFunnyName.trim() || rollFunnyNickname();
    setGuestFunnyName(chosenNick);
    const res = await quickPlayGuest(chosenNick);
    setBusy(false);
    if (res.ok && res.user) {
      onUserUpdated(res.user);
      onClose();
    } else {
      setFeedback({ text: res.error || 'Lỗi tạo phiên Chơi Luôn', isError: true });
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);
    const res =
      authMode === 'REGISTER'
        ? await registerAccount(username, password, registerNick.trim() || username)
        : await loginAccount(username, password);
    setBusy(false);
    if (res.ok && res.user) {
      onUserUpdated(res.user);
      onClose();
    } else {
      setFeedback({ text: res.error || 'Thao tác thất bại', isError: true });
    }
  };

  const handleBuyOrEquip = async (
    category: 'SKIN' | 'FLAME',
    itemCode: HeroSkinId | FlameColorId
  ) => {
    if (!user) {
      setFeedback({
        text: 'Vui lòng chọn Chơi Luôn hoặc Đăng Nhập trước khi mua/trang bị!',
        isError: true,
      });
      onChangeTab('AUTH');
      return;
    }
    setBusy(true);
    setFeedback(null);
    const res = await buyOrEquipItem(user.id, category, itemCode);
    setBusy(false);
    if (res.ok && res.user) {
      onUserUpdated(res.user);
      setFeedback({ text: `Đã trang bị vật phẩm thành công!` });
    } else {
      setFeedback({ text: res.error || 'Không thể giao dịch', isError: true });
    }
  };

  return (
    <div
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(7, 14, 28, 0.25) 0%, rgba(7, 14, 28, 0.55) 55%, rgba(6, 10, 20, 0.78) 100%), url('/login-castle-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-2 sm:p-4 overflow-y-auto"
    >
      {/* Decorative Bottom-Corner Slimes & Fire Glow (on large screens) */}
      <div className="pointer-events-none fixed bottom-2 left-3 hidden xl:flex items-end gap-1 z-10">
        <CuteBlueSlimeSvg className="w-24 h-24 drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)] animate-bounce" />
      </div>
      <div className="pointer-events-none fixed bottom-2 right-3 hidden xl:flex items-end gap-1 z-10">
        <CuteBlueSlimeSvg className="w-24 h-24 drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)] animate-bounce" />
      </div>

      {/* MAIN SCENE CONTAINER */}
      <div className="relative w-full max-w-[1040px] my-auto flex flex-col items-center z-20">
        {/* =====================================================================
            1. TOP BANNER SECTION: CHIBI HEROES + 3D TITLE CREST + WOOD SIGNBOARD
           ===================================================================== */}
        <div className="relative w-full flex flex-col lg:flex-row items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-3 pt-1">
          {/* Left Chibi Hero Jumping with Bomb */}
          <div className="hidden md:flex items-center justify-center lg: -mr-6 z-20 pointer-events-none select-none">
            <ChibiBomberBoySvg className="w-36 h-36 lg:w-44 lg:h-44 drop-shadow-[0_10px_16px_rgba(0,0,0,0.85)]" />
          </div>

          {/* Center 3D Stone & Wooden Ribbon Title Crest */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-8 py-2.5 rounded-3xl bg-gradient-to-b from-[#334155]/95 via-[#1e293b]/95 to-[#0f172a]/95 border-4 border-[#64748b] shadow-[0_12px_30px_rgba(0,0,0,0.9),inset_0_2px_0_rgba(255,255,255,0.35)]">
            {/* Mossy Top Accent */}
            <div className="absolute -top-2.5 left-6 right-6 h-3 bg-gradient-to-r from-transparent via-emerald-500/80 to-transparent rounded-full blur-[1px]" />

            {/* Line 1: CỬA HÀNG XU (3D Extruded Gold Text) */}
            <h1
              style={{
                textShadow:
                  '0 3px 0 #78350f, 0 6px 0 #291306, 0 8px 16px rgba(0,0,0,0.9), -2px -2px 0 #451a03, 2px -2px 0 #451a03, -2px 2px 0 #451a03, 2px 2px 0 #451a03',
              }}
              className="font-game font-black text-2xl sm:text-4xl lg:text-[42px] tracking-wider text-amber-300 leading-none uppercase select-none"
            >
              CỬA HÀNG XU
            </h1>

            {/* Line 2: ĐẤU TRƯỜNG 4P (3D Extruded Fiery Red-Orange + Silver 4P) */}
            <div className="flex items-center justify-center gap-2 mt-1">
              <span
                style={{
                  textShadow:
                    '0 3px 0 #7f1d1d, 0 6px 0 #270909, 0 8px 16px rgba(0,0,0,0.9), -2px -2px 0 #450a0a, 2px -2px 0 #450a0a, -2px 2px 0 #450a0a, 2px 2px 0 #450a0a',
                }}
                className="font-game font-black text-2xl sm:text-4xl lg:text-[40px] tracking-wide text-[#ff5a1f] leading-none uppercase select-none"
              >
                ĐẤU TRƯỜNG
              </span>
              <span
                style={{
                  textShadow:
                    '0 3px 0 #334155, 0 6px 0 #0f172a, -2px -2px 0 #0f172a, 2px -2px 0 #0f172a',
                }}
                className="font-game font-black text-2xl sm:text-4xl lg:text-[40px] text-slate-100 leading-none uppercase select-none"
              >
                4P
              </span>
            </div>

            {/* Bottom Carved Wooden Ribbon */}
            <div className="mt-2 px-4 sm:px-6 py-1 rounded-full bg-gradient-to-b from-[#783f16] via-[#5c2e0e] to-[#3b1c07] border-2 border-[#a16207] shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
              <p className="font-game font-extrabold text-[11px] sm:text-xs tracking-wider text-amber-100 uppercase">
                CHƠI LUÔN • ĐẶT BẮT ĐẦU • PHIÊU LƯU CÙNG BẠN BÈ
              </p>
            </div>
          </div>

          {/* Right Chibi Hood Girl Sitting with Bomb */}
          <div className="hidden md:flex items-center justify-center lg:-ml-5 z-20 pointer-events-none select-none">
            <ChibiBomberGirlSvg className="w-28 h-28 lg:w-36 lg:h-36 drop-shadow-[0_10px_16px_rgba(0,0,0,0.85)]" />
          </div>

          {/* Top-Right Wooden Feature Signboard (4 Planks) */}
          <div className="hidden xl:flex flex-col gap-1 bg-gradient-to-b from-[#7c4319] via-[#5e3010] to-[#422008] border-3 border-[#311504] rounded-xl px-3.5 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.85)] -rotate-2 select-none">
            {[
              'ĐẤU TRƯỜNG 4 NGƯỜI',
              'NHIỀU BẢN ĐỒ HẤP DẪN',
              'SHOP XU & VẬT PHẨM',
              'CHƠI MIỄN PHÍ - CỰC VUI',
            ].map((line) => (
              <div
                key={line}
                className="flex items-center gap-1.5 text-[11px] font-game font-bold text-amber-100 border-b border-[#3b1c07]/70 last:border-none pb-0.5 last:pb-0"
              >
                <span className="w-4 h-4 rounded-full bg-amber-500/25 border border-amber-400 text-amber-300 flex items-center justify-center text-[10px]">
                  ✔
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>

          {/* Close Button if player is already in game and opened Hub */}
          {user && (
            <button
              onClick={onClose}
              title="Đóng cửa sổ và quay lại trận đấu"
              className="absolute top-1 right-1 sm:right-2 z-30 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:translate-y-0.5 text-white font-game font-bold text-xs rounded-xl border-2 border-rose-300 shadow-[0_4px_0_#881337] cursor-pointer"
            >
              ✕ ĐÓNG
            </button>
          )}
        </div>

        {/* Feedback Alert Banner (if any) */}
        {feedback && (
          <div
            className={`w-full max-w-[960px] mb-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 flex items-center justify-between shadow-lg ${
              feedback.isError
                ? 'bg-rose-950/95 text-rose-200 border-rose-400'
                : 'bg-emerald-950/95 text-emerald-200 border-emerald-400'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs px-2 py-0.5 rounded bg-black/30 hover:bg-black/50 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* =====================================================================
            2. CENTER STONE FORTRESS PANELS + FLICKERING WALL TORCHES
           ===================================================================== */}
        <div className="relative w-full max-w-[960px]">
          {/* Left Mounted Flickering Torch */}
          <div className="hidden lg:block pointer-events-none absolute -left-9 top-1/2 -translate-y-1/2 z-30">
            <WallTorchSvg className="w-12 h-24 drop-shadow-[0_0_18px_rgba(245,158,11,0.85)]" />
          </div>

          {/* Right Mounted Flickering Torch */}
          <div className="hidden lg:block pointer-events-none absolute -right-9 top-1/2 -translate-y-1/2 z-30">
            <WallTorchSvg className="w-12 h-24 drop-shadow-[0_0_18px_rgba(245,158,11,0.85)]" />
          </div>

          {/* TAB 1: DUAL STONE FORTRESS LOGIN & QUICK PLAY (Matches Reference Image 1:1) */}
          {activeTab === 'AUTH' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 bg-[#1e293b]/90 p-2.5 sm:p-3.5 rounded-2xl border-4 border-[#475569] shadow-[0_20px_50px_rgba(0,0,0,0.92),inset_0_2px_0_rgba(255,255,255,0.2)]">
              {/* -----------------------------------------------------------------
                  LEFT FORTRESS WING: CHƠI LUÔN (TÊN HÀI HƯỚC) - MOSSY GREEN STONE
                 ----------------------------------------------------------------- */}
              <div className="relative bg-gradient-to-b from-[#283548] to-[#1a2436] border-3 border-[#526580] rounded-xl p-3 sm:p-4 flex flex-col justify-between space-y-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
                {/* Decorative Moss / Vine Top Accents */}
                <div className="pointer-events-none absolute -top-1.5 left-4 w-16 h-3 bg-emerald-500/70 rounded-full blur-[1px]" />
                <div className="pointer-events-none absolute -top-1.5 right-6 w-12 h-3 bg-emerald-500/70 rounded-full blur-[1px]" />

                {/* Emerald Green Stone Header Banner */}
                <div className="bg-gradient-to-b from-[#1e7b3b] via-[#166534] to-[#0f4722] border-2 border-[#4ade80]/70 rounded-xl px-3.5 py-2.5 flex items-center gap-3 shadow-[0_5px_0_#052e16]">
                  <GreenCubeMascotSvg className="w-12 h-12 shrink-0 drop-shadow-[0_3px_4px_rgba(0,0,0,0.6)]" />
                  <div>
                    <h2
                      style={{ textShadow: '0 2px 0 #052e16' }}
                      className="font-game font-black text-base sm:text-xl text-amber-300 tracking-wide uppercase leading-tight"
                    >
                      CHƠI LUÔN (TÊN HÀI HƯỚC)
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-100 font-semibold mt-0.5">
                      Không cần mật khẩu - Vào game ngay!
                    </p>
                  </div>
                </div>

                {/* Recessed Dark Stone Body */}
                <form
                  onSubmit={(e) => handleQuickGuest(e, false)}
                  className="bg-[#0d1624] border-2 border-[#334766] rounded-xl p-3.5 space-y-3 shadow-inner"
                >
                  {/* Nickname Label + Dice Roll Link */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-200">
                      Nickname ngẫu nhiên của bạn:
                    </label>
                    <button
                      type="button"
                      onClick={() => setGuestFunnyName(rollFunnyNickname(guestFunnyName))}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-game font-bold text-amber-300 hover:text-amber-200 cursor-pointer group"
                    >
                      <Dice3DSvg className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      <span className="underline decoration-amber-400/80 underline-offset-4">
                        Đổi tên khác
                      </span>
                    </button>
                  </div>

                  {/* Input Box + Square Stone Dice Button */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={guestFunnyName}
                      onChange={(e) => setGuestFunnyName(e.target.value)}
                      maxLength={15}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="VD: BOM_XỊT_PRO"
                      className="flex-1 h-12 px-4 bg-[#070d17] border-2 border-[#2d4263] rounded-xl text-sky-200 text-base sm:text-lg font-mono-num font-extrabold tracking-wide select-text focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setGuestFunnyName(rollFunnyNickname(guestFunnyName))}
                      title="Đổi tên hài hước ngẫu nhiên"
                      className="w-12 h-12 bg-gradient-to-b from-[#283952] to-[#172234] hover:from-[#334866] hover:to-[#1e2d44] active:translate-y-0.5 border-2 border-[#4d658a] rounded-xl flex items-center justify-center cursor-pointer shadow-[0_4px_0_#090f1a] shrink-0 transition-all"
                    >
                      <Dice3DSvg className="w-7 h-7" />
                    </button>
                  </div>

                  {/* Primary 3D Glossy Green CTA Button */}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-2.5 px-4 bg-gradient-to-b from-[#4ade80] via-[#22c55e] to-[#16a34a] hover:from-[#86efac] hover:via-[#4ade80] hover:to-[#22c55e] active:translate-y-0.5 rounded-xl border-2 border-[#bbf7d0] shadow-[0_6px_0_#064e3b,0_10px_20px_rgba(0,0,0,0.6)] flex items-center justify-between cursor-pointer transition-all"
                  >
                    <RunningHeroIconSvg className="w-11 h-11 shrink-0 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]" />
                    <div className="flex flex-col items-center text-center">
                      <span className="font-game font-black text-lg sm:text-2xl text-[#052e16] tracking-wide leading-none">
                        CHƠI LUÔN NGAY!
                      </span>
                      <span className="font-game font-extrabold text-[11px] sm:text-xs text-[#052e16]/90 mt-0.5">
                        (+400 XU KHỞI ĐẦU)
                      </span>
                    </div>
                    <span className="font-game font-black text-2xl text-[#052e16] pr-1">❯</span>
                  </button>

                  {/* Gift Box Bonus Info Pill */}
                  <div className="bg-[#09111e] border border-[#253855] rounded-xl px-3 py-2 flex items-center gap-2.5">
                    <GiftBoxSvg className="w-9 h-9 shrink-0" />
                    <p className="text-xs sm:text-[13px] text-slate-200 leading-snug">
                      Hệ thống tự cấp cho bạn một Nickname lầy tên hài hước kèm{' '}
                      <strong className="text-amber-300 font-extrabold">400 Xu</strong> để chiến ngay lập tức!
                    </p>
                  </div>
                </form>
              </div>

              {/* -----------------------------------------------------------------
                  RIGHT FORTRESS WING: ĐĂNG NHẬP / ĐĂNG KÝ - CARVED WOOD & STONE
                 ----------------------------------------------------------------- */}
              <div className="relative bg-gradient-to-b from-[#283548] to-[#1a2436] border-3 border-[#526580] rounded-xl p-3 sm:p-4 flex flex-col justify-between space-y-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
                {/* Warm Wooden Header Banner with Golden Key */}
                <div className="bg-gradient-to-b from-[#7c4217] via-[#5e2f0d] to-[#3f1e06] border-2 border-[#b45309] rounded-xl px-3.5 py-2.5 flex items-center gap-3 shadow-[0_5px_0_#271102]">
                  <GoldenKeySvg className="w-12 h-12 shrink-0 drop-shadow-[0_3px_4px_rgba(0,0,0,0.65)]" />
                  <div>
                    <h2
                      style={{ textShadow: '0 2px 0 #271102' }}
                      className="font-game font-black text-base sm:text-xl text-amber-300 tracking-wide uppercase leading-tight"
                    >
                      {authMode === 'REGISTER' ? 'ĐĂNG KÝ TÀI KHOẢN MỚI' : 'ĐĂNG NHẬP / ĐĂNG KÝ'}
                    </h2>
                    <p className="text-xs text-amber-100/95 leading-snug mt-0.5">
                      Lưu vĩnh viễn Xu, Điểm ELO, Giáp & Màu Lửa Bom vào tài khoản. Đăng ký mới tặng{' '}
                      <strong className="text-amber-300 font-extrabold">600 Xu!</strong>
                    </p>
                  </div>
                </div>

                {/* Recessed Dark Stone Form */}
                <form
                  onSubmit={handleAccountSubmit}
                  className="bg-[#0d1624] border-2 border-[#334766] rounded-xl p-3.5 flex-1 flex flex-col justify-between space-y-2.5 shadow-inner"
                >
                  {user && !user.isGuest && (
                    <div className="bg-emerald-950/80 border-2 border-emerald-400/80 rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-emerald-200">
                          <span className="font-game font-bold text-emerald-300">
                            ✓ ĐÃ LƯU TÀI KHOẢN (SQLite DB):
                          </span>{' '}
                          <strong className="text-amber-300 font-mono-num">@{user.username}</strong>
                          <span className="text-slate-300">
                            {' '}
                            • Biệt danh: <strong className="text-white">{user.displayName}</strong> ({user.coins} Xu)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            saveUserLocal(null);
                            onUserUpdated(null);
                            setFeedback({ text: 'Đã đăng xuất tài khoản.' });
                          }}
                          className="px-2 py-0.5 rounded bg-rose-600/80 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer shrink-0"
                        >
                          Đăng xuất
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onChangeTab('MULTI')}
                          className="py-1.5 px-2 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-game font-black text-xs cursor-pointer"
                        >
                          🌐 TẠO / VÀO PHÒNG 4P
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="py-1.5 px-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-game font-black text-xs cursor-pointer"
                        >
                          ▶ VÀO GAME NGAY
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {/* Username Input with Icon */}
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400 text-base pointer-events-none">
                        👤
                      </span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        spellCheck={false}
                        placeholder="Tên tài khoản (VD: duocnt, duocnt2)..."
                        className="w-full h-11 pl-10 pr-3.5 bg-[#070d17] border-2 border-[#2d4263] rounded-xl text-white text-sm font-medium select-text focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 shadow-inner"
                      />
                    </div>

                    {/* Password Input with Lock Icon */}
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400 text-base pointer-events-none">
                        🔒
                      </span>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={authMode === 'REGISTER' ? 'new-password' : 'current-password'}
                        placeholder="Mật khẩu (từ 3 ký tự)..."
                        className="w-full h-11 pl-10 pr-3.5 bg-[#070d17] border-2 border-[#2d4263] rounded-xl text-white text-sm font-medium select-text focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 shadow-inner"
                      />
                    </div>

                    {/* Optional Display Name when Registering */}
                    {authMode === 'REGISTER' && (
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400 text-base pointer-events-none">
                          🏷️
                        </span>
                        <input
                          type="text"
                          value={registerNick}
                          onChange={(e) => setRegisterNick(e.target.value)}
                          maxLength={15}
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="Biệt danh trên đầu nhân vật (trống = lấy tên TK)..."
                          className="w-full h-11 pl-10 pr-3.5 bg-[#070d17] border-2 border-[#2d4263] rounded-xl text-amber-200 text-sm font-medium select-text focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 shadow-inner"
                        />
                      </div>
                    )}
                  </div>

                  {/* Primary 3D Glossy Golden-Yellow CTA Button */}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-3 px-4 bg-gradient-to-b from-[#fde047] via-[#facc15] to-[#eab308] hover:from-[#fef08a] hover:via-[#fde047] hover:to-[#facc15] active:translate-y-0.5 rounded-xl border-2 border-[#fef9c3] shadow-[0_6px_0_#854d0e,0_10px_20px_rgba(0,0,0,0.6)] flex items-center justify-between cursor-pointer transition-all"
                  >
                    <CrossedSwordsSvg className="w-9 h-9 shrink-0" />
                    <span className="font-game font-black text-base sm:text-xl text-[#1c1004] tracking-wide">
                      {authMode === 'REGISTER'
                        ? 'ĐĂNG KÝ & VÀO GAME (+600 XU)'
                        : 'ĐĂNG NHẬP & VÀO GAME'}
                    </span>
                    <span className="font-game font-black text-2xl text-[#1c1004] pr-1">❯</span>
                  </button>

                  {/* Footer Toggle Links matching Reference Image */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs sm:text-sm">
                    {authMode === 'LOGIN' ? (
                      <div className="text-slate-300">
                        Chưa có tài khoản?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setFeedback(null);
                            setAuthMode('REGISTER');
                          }}
                          className="font-bold text-sky-400 hover:text-sky-300 underline underline-offset-4 cursor-pointer"
                        >
                          Đăng ký ngay
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-300">
                        Đã có tài khoản?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setFeedback(null);
                            setAuthMode('LOGIN');
                          }}
                          className="font-bold text-sky-400 hover:text-sky-300 underline underline-offset-4 cursor-pointer"
                        >
                          Đăng nhập ngay
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setFeedback({
                          text: 'Mẹo: Nếu quên mật khẩu, bạn có thể bấm "Đăng ký ngay" để tạo tài khoản mới (+600 Xu) hoặc bấm "CHƠI LUÔN NGAY!" ở khung bên trái!',
                        })
                      }
                      className="font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-4 cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: COIN SHOP & CUSTOM BOMB FLAMES (Inside the Stone Fortress Frame) */}
          {activeTab === 'SHOP' && (
            <div className="bg-[#131f36]/95 border-4 border-[#526580] rounded-2xl p-4 sm:p-5 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.92)] max-h-[62vh] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2b426b] pb-3">
                <div className="flex items-center gap-2.5">
                  <GoldCoinsStackSvg className="w-9 h-9" />
                  <div>
                    <h3 className="font-game font-black text-base sm:text-lg text-amber-300">
                      CỬA HÀNG XU • MÀU LỬA BOM & GIÁP HIỆP SĨ
                    </h3>
                    <p className="text-xs text-slate-300">
                      Số dư hiện tại:{' '}
                      <strong className="text-amber-300 font-mono-num">{user?.coins ?? 400} Xu</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onChangeTab('AUTH')}
                    className="px-3 py-1.5 bg-[#1e2f4d] hover:bg-[#283e66] text-slate-200 font-game font-bold text-xs rounded-lg border border-[#47689b] cursor-pointer"
                  >
                    ⬅ CỔNG TÀI KHOẢN
                  </button>
                  {user && (
                    <button
                      onClick={onClose}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-game font-bold text-xs rounded-lg border border-white cursor-pointer"
                    >
                      ▶ VÀO TRẬN NGAY
                    </button>
                  )}
                </div>
              </div>

              {/* Bomb Flame Colors */}
              <div>
                <h4 className="font-game font-bold text-xs sm:text-sm text-amber-400 mb-2">
                  🔥 MÀU LỬA BOM ĐẶC BIỆT (HIỂN THỊ KHI BOM NỔ):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {FLAME_LIST.map((flameId) => {
                    const meta = FLAME_PALETTES[flameId];
                    const isOwned =
                      flameId === 'CLASSIC_ORANGE' ||
                      Boolean(user?.unlockedFlames?.includes(flameId));
                    const isEquipped = (user?.equippedFlame || 'CLASSIC_ORANGE') === flameId;

                    return (
                      <div
                        key={flameId}
                        className={`p-3 rounded-xl border-2 flex items-center justify-between gap-2 ${
                          isEquipped
                            ? 'bg-[#1a2c4e] border-amber-400'
                            : 'bg-[#0b1324] border-[#2b426b]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center shrink-0"
                            style={{
                              background: `radial-gradient(circle, ${meta.core} 15%, ${meta.inner} 45%, ${meta.mid} 75%, ${meta.outer} 100%)`,
                            }}
                          >
                            💥
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-white">{meta.name}</div>
                            <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                              {isOwned ? (
                                <span className="text-emerald-300">✓ Đã sở hữu</span>
                              ) : (
                                <>
                                  <PixelCoinSvg className="w-3.5 h-3.5" />
                                  <span className="font-mono-num">{meta.price} Xu</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleBuyOrEquip('FLAME', flameId)}
                          disabled={busy || isEquipped}
                          className={`px-3 py-1.5 rounded-lg font-game font-bold text-xs cursor-pointer shrink-0 ${
                            isEquipped
                              ? 'bg-emerald-500 text-slate-950'
                              : isOwned
                                ? 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                                : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          }`}
                        >
                          {isEquipped ? 'ĐANG DÙNG' : isOwned ? 'TRANG BỊ' : `${meta.price} XU`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hero Armor Skins */}
              <div>
                <h4 className="font-game font-bold text-xs sm:text-sm text-sky-300 mb-2">
                  🛡️ GIÁP HIỆP SĨ & CHỈ SỐ CỘNG THÊM:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SKIN_LIST.map((skinId) => {
                    const meta = HERO_SKINS[skinId];
                    const price = SKIN_PRICES[skinId];
                    const isOwned =
                      skinId === 'KNIGHT_RED' || Boolean(user?.unlockedSkins?.includes(skinId));
                    const isEquipped = (user?.equippedSkin || 'KNIGHT_RED') === skinId;

                    return (
                      <div
                        key={skinId}
                        className={`p-3 rounded-xl border-2 flex items-center justify-between gap-2 ${
                          isEquipped
                            ? 'bg-[#1a2c4e] border-sky-400'
                            : 'bg-[#0b1324] border-[#2b426b]'
                        }`}
                      >
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white">{meta.name}</div>
                          <div className="text-[11px] text-emerald-300">{meta.bonusDesc}</div>
                        </div>

                        <button
                          onClick={() => handleBuyOrEquip('SKIN', skinId)}
                          disabled={busy || isEquipped}
                          className={`px-3 py-1.5 rounded-lg font-game font-bold text-xs cursor-pointer shrink-0 ${
                            isEquipped
                              ? 'bg-emerald-500 text-slate-950'
                              : isOwned
                                ? 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                                : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          }`}
                        >
                          {isEquipped ? 'ĐANG DÙNG' : isOwned ? 'TRANG BỊ' : `${price} XU`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 4-PLAYER BATTLE ROYALE & WEBSOCKET ROOMS */}
          {activeTab === 'MULTI' && (
            <div className="bg-[#131f36]/95 border-4 border-[#526580] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.92)] max-h-[68vh] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2b426b] pb-2.5">
                <div className="flex items-center gap-2.5">
                  <GoldenTrophySvg className="w-9 h-9" />
                  <div>
                    <h3 className="font-game font-black text-base sm:text-lg text-amber-300">
                      ĐẤU TRƯỜNG 4 NGƯỜI • PHÒNG ONLINE & DANH SÁCH PHÒNG ĐANG MỞ
                    </h3>
                    <p className="text-xs text-slate-300">
                      {user ? (
                        <span>
                          Đang đăng nhập:{' '}
                          <strong className="text-emerald-300 font-mono-num">@{user.username}</strong> • Biệt danh:{' '}
                          <strong className="text-amber-300">{user.displayName}</strong> ({user.coins} Xu)
                        </span>
                      ) : (
                        <span>Chưa đăng nhập • Sẽ dùng tên khách ngẫu nhiên khi vào phòng</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onChangeTab('AUTH')}
                  className="px-3 py-1.5 bg-[#1e2f4d] hover:bg-[#283e66] text-slate-200 font-game font-bold text-xs rounded-lg border border-[#47689b] cursor-pointer"
                >
                  ⬅ CỔNG TÀI KHOẢN
                </button>
              </div>

              {/* Room Status / Join Confirmation Notice */}
              {roomNotice && (
                <div
                  className={`px-3.5 py-2 rounded-xl border-2 text-xs sm:text-sm font-bold flex items-center justify-between gap-2 ${
                    roomNotice.isError
                      ? 'bg-rose-950/90 border-rose-400 text-rose-200'
                      : 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                  }`}
                >
                  <span>{roomNotice.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* LEFT COLUMN: PUBLIC ACTIVE ROOMS LIST + INSTANT 4P */}
                <div className="space-y-3 flex flex-col justify-between">
                  {/* Live Public Rooms Directory */}
                  <div className="bg-[#0b1324] border-2 border-emerald-400/80 rounded-xl p-3.5 space-y-2.5 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400 rounded text-xs font-game font-bold text-emerald-300">
                        📋 DANH SÁCH PHÒNG ĐANG MỞ ({publicRooms.length})
                      </span>
                      <button
                        type="button"
                        onClick={onRefreshRooms}
                        className="px-2.5 py-1 rounded-lg bg-[#162642] hover:bg-[#1f355c] border border-sky-400/50 text-sky-200 font-game font-bold text-[11px] cursor-pointer"
                      >
                        🔄 LÀM MỚI
                      </button>
                    </div>

                    {publicRooms.length === 0 ? (
                      <div className="bg-[#070d17] border border-dashed border-[#2b426b] rounded-xl p-3 text-center space-y-1">
                        <div className="text-xs font-bold text-slate-300">
                          Chưa có phòng nào đang mở trên máy chủ
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Hãy nhập mã phòng (VD: <code className="text-amber-300">1111</code>) ở khung bên phải và bấm <strong className="text-sky-300">➕ TẠO PHÒNG</strong> để mở phòng đầu tiên!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[185px] overflow-y-auto pr-1">
                        {publicRooms.map((r) => {
                          const isCurrent = roomCode === r.roomCode;
                          const isFull = r.playerCount >= 4;
                          return (
                            <div
                              key={r.roomCode}
                              className={`p-2.5 rounded-xl border-2 flex items-center justify-between gap-2 ${
                                isCurrent
                                  ? 'bg-[#122b29] border-emerald-400'
                                  : 'bg-[#070d17] border-[#2b426b] hover:border-sky-400/70'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono-num font-black text-sm text-amber-300">
                                    PHÒNG #{r.roomCode}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-400/50 text-[10px] font-bold text-sky-200">
                                    👥 {r.playerCount}/4 Người
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-[10px] font-bold text-amber-200">
                                    {r.botCount === 0 ? '0 BOT' : `🤖 ${r.botCount} BOT`}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-300 truncate mt-0.5">
                                  👑 Chủ phòng:{' '}
                                  <strong className="text-white">{r.hostDisplayName}</strong>{' '}
                                  <span className="text-emerald-300 font-mono-num">
                                    (@{r.hostUsername})
                                  </span>
                                  {r.inProgress && (
                                    <span className="ml-1.5 text-amber-300 font-bold">
                                      • ⚔️ Đang trên sân
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={isCurrent || isFull}
                                onClick={async () => {
                                  setRoomInput(r.roomCode);
                                  if (!user) {
                                    const res = await quickPlayGuest(
                                      guestFunnyName || rollFunnyNickname()
                                    );
                                    if (res.ok && res.user) onUserUpdated(res.user);
                                  }
                                  onCreateOrJoinRoom(r.roomCode, r.botCount, 'JOIN');
                                }}
                                className={`px-3 py-1.5 rounded-lg font-game font-bold text-xs shrink-0 cursor-pointer ${
                                  isCurrent
                                    ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-200 cursor-default'
                                    : isFull
                                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                      : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 border border-white shadow-[0_3px_0_#065f46]'
                                }`}
                              >
                                {isCurrent ? '✔ ĐANG Ở ĐÂY' : isFull ? 'ĐẦY 4/4' : '👉 VÀO PHÒNG'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Instant 4P Mode with 3 AI Bots */}
                  <div className="bg-[#0b1324] border-2 border-amber-400/80 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-game font-bold text-amber-300">
                        🔥 ĐẤU NHANH 4 GÓC VỚI 3 MÁY (OFFLINE)
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Vào thẳng trận sinh tồn 4 góc với 3 BOT AI & Bóng Ma Báo Thù
                      </p>
                    </div>

                    {isBattleRoyale && !roomCode ? (
                      <button
                        onClick={() => {
                          onStopBattleRoyale();
                          onClose();
                        }}
                        className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-game font-bold text-xs rounded-xl border border-rose-300 cursor-pointer shrink-0"
                      >
                        ⏹️ VỀ VƯỢT ẢI
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!user) {
                            quickPlayGuest(guestFunnyName || rollFunnyNickname()).then((res) => {
                              if (res.ok && res.user) onUserUpdated(res.user);
                              onStartBattleRoyale();
                              onClose();
                            });
                          } else {
                            onStartBattleRoyale();
                            onClose();
                          }
                        }}
                        className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-game font-black text-xs rounded-xl border-2 border-white shadow-[0_4px_0_#92400e] cursor-pointer shrink-0"
                      >
                        ⚔️ ĐẤU 3 BOT NGAY
                      </button>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: CREATE / JOIN ROOM + BOT COUNT SELECTOR + 4 SLOTS */}
                <div className="bg-[#0b1324] border-2 border-sky-400/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 bg-sky-500/20 border border-sky-400 rounded text-xs font-game font-bold text-sky-300">
                        🌐 TẠO PHÒNG MỚI HOẶC NHẬP MÃ JOIN
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-300">
                        {roomBotCount === 0 ? '👤 Mặc định: 0 BOT' : `🤖 Có ${roomBotCount} BOT`}
                      </span>
                    </div>

                    {/* Bot Count Selector */}
                    <div className="bg-[#070d17] border border-[#243754] rounded-xl p-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                        <span>🤖 Chọn số lượng BOT chơi cùng khi Tạo Phòng:</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { count: 0, label: '0 BOT', sub: 'Chờ người' },
                          { count: 1, label: '1 BOT', sub: '+Chờ 2 người' },
                          { count: 2, label: '2 BOT', sub: '+Chờ 1 người' },
                          { count: 3, label: '3 BOT', sub: 'Đủ 4 góc' },
                        ].map((opt) => {
                          const active = roomBotCount === opt.count;
                          return (
                            <button
                              key={opt.count}
                              type="button"
                              onClick={() => onChangeRoomBotCount(opt.count)}
                              className={`py-1.5 px-1 rounded-lg border text-center cursor-pointer transition-all ${
                                active
                                  ? opt.count === 0
                                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                                    : 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.25)]'
                                  : 'bg-[#0f192d] border-[#293d5c] text-slate-400 hover:text-slate-200 hover:border-sky-400/50'
                              }`}
                            >
                              <div className="font-game font-black text-xs">{opt.label}</div>
                              <div className="text-[10px] leading-tight opacity-90">{opt.sub}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Room Code Input + Separate CREATE vs JOIN buttons */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={roomInput}
                          onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                          maxLength={6}
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="Mã phòng (VD: 1111)..."
                          className="w-36 sm:w-40 px-3 py-2 bg-[#070d17] border-2 border-[#2d4263] rounded-xl text-amber-300 text-sm font-mono-num font-extrabold select-text focus:outline-none focus:border-sky-400"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const targetCode = (roomInput || '1111').trim().toUpperCase();
                            if (!user) {
                              const res = await quickPlayGuest(
                                guestFunnyName || rollFunnyNickname()
                              );
                              if (res.ok && res.user) onUserUpdated(res.user);
                            }
                            onCreateOrJoinRoom(targetCode, roomBotCount, 'CREATE');
                          }}
                          className="flex-1 py-2 px-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-game font-bold text-xs rounded-xl border border-white cursor-pointer"
                        >
                          ➕ TẠO PHÒNG
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const targetCode = (roomInput || '1111').trim().toUpperCase();
                            if (!user) {
                              const res = await quickPlayGuest(
                                guestFunnyName || rollFunnyNickname()
                              );
                              if (res.ok && res.user) onUserUpdated(res.user);
                            }
                            onCreateOrJoinRoom(targetCode, roomBotCount, 'JOIN');
                          }}
                          className="flex-1 py-2 px-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-game font-bold text-xs rounded-xl border border-white cursor-pointer"
                        >
                          🚪 VÀO PHÒNG
                        </button>
                      </div>
                    </div>
                  </div>

                  {roomCode ? (
                    <div className="bg-[#131f36] border-2 border-sky-400/70 rounded-xl p-2.5 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                        <span className="text-sky-200">
                          Phòng: <strong className="text-amber-300 font-mono-num text-sm">#{roomCode}</strong>
                          <span className="ml-1.5 text-[11px] text-emerald-300 font-semibold">
                            • Vị trí của bạn: <strong className="text-amber-300">{assignedSlot}</strong>
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={onLeaveRoom}
                            className="px-2 py-1 bg-rose-600/80 hover:bg-rose-500 text-white font-game font-bold text-[11px] rounded cursor-pointer"
                          >
                            🚪 RỜI
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onStartRoomMatch();
                              onClose();
                            }}
                            className="px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-game font-black text-xs rounded border border-white cursor-pointer"
                          >
                            🚀 BẮT ĐẦU TRẬN
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(() => {
                          const emptySlots = ['P2', 'P3', 'P4'].filter(
                            (s) => !roomMembers.some((m) => m.slot === s)
                          );
                          const botAssignedSlots = new Set(emptySlots.slice(0, roomBotCount));

                          return ['P1', 'P2', 'P3', 'P4'].map((slot) => {
                            const member = roomMembers.find((m) => m.slot === slot);
                            const isBotSlot = !member && botAssignedSlots.has(slot);
                            const isMe = slot === assignedSlot && Boolean(member);
                            return (
                              <div
                                key={slot}
                                className={`p-1.5 rounded-lg border text-center text-[11px] ${
                                  isMe
                                    ? 'bg-[#0f2e2e] border-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.35)]'
                                    : member
                                      ? 'bg-[#0b1f24] border-sky-400/70'
                                      : isBotSlot
                                        ? 'bg-[#1f190b] border-amber-400/70'
                                        : 'bg-[#090f1d] border-dashed border-[#365078]'
                                }`}
                              >
                                <div className="font-game font-bold text-amber-300 flex items-center justify-center gap-0.5">
                                  <span>{slot === 'P1' ? '👑 P1' : slot}</span>
                                  {isMe && (
                                    <span className="text-[9px] px-1 rounded bg-emerald-400 text-slate-950 font-black">
                                      BẠN
                                    </span>
                                  )}
                                </div>
                                <div
                                  className={`truncate font-bold ${
                                    member
                                      ? 'text-emerald-300'
                                      : isBotSlot
                                        ? 'text-amber-200'
                                        : 'text-slate-400'
                                  }`}
                                >
                                  {member
                                    ? `👤 ${member.displayName}`
                                    : isBotSlot
                                      ? '🤖 BOT AI'
                                      : '⏳ Chờ người...'}
                                </div>
                                {member?.username && (
                                  <div className="truncate text-[10px] font-mono-num text-sky-300">
                                    @{member.username}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      💡 <strong>Cách chơi 2–4 người:</strong> Người 1 nhập mã (VD: <code className="text-amber-300">1111</code>) bấm <strong className="text-sky-300">➕ TẠO PHÒNG</strong>. Người 2 sẽ thấy ngay Phòng <code className="text-amber-300">#1111</code> ở khung <strong className="text-emerald-300">📋 DANH SÁCH PHÒNG ĐANG MỞ</strong> bên trái để bấm <strong className="text-emerald-300">👉 VÀO PHÒNG</strong>!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 8 SEQUENTIAL MAPS SHOWCASE */}
          {activeTab === 'MAPS' && (
            <div className="bg-[#131f36]/95 border-4 border-[#526580] rounded-2xl p-4 sm:p-5 space-y-3 shadow-[0_20px_50px_rgba(0,0,0,0.92)] max-h-[62vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#2b426b] pb-2.5">
                <div className="flex items-center gap-2.5">
                  <TreasureMapSvg className="w-9 h-9" />
                  <div>
                    <h3 className="font-game font-black text-base sm:text-lg text-amber-300">
                      HÀNH TRÌNH 8 BẢN ĐỒ CHIẾN DỊCH (CHƠI LẦN LƯỢT TỪ 1-1)
                    </h3>
                    <p className="text-xs text-slate-300">
                      Tiêu diệt sạch quái vật và bước vào Cổng EXIT để mở khóa bản đồ tiếp theo!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onChangeTab('AUTH')}
                  className="px-3 py-1.5 bg-[#1e2f4d] hover:bg-[#283e66] text-slate-200 font-game font-bold text-xs rounded-lg border border-[#47689b] cursor-pointer"
                >
                  ⬅ QUAY LẠI
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {LEVELS.map((lv, idx) => (
                  <div
                    key={lv.code}
                    className={`p-3 rounded-xl border-2 ${
                      idx === 0
                        ? 'bg-[#1a2c4e] border-amber-400'
                        : 'bg-[#0b1324] border-[#2b426b] opacity-85'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-game font-bold mb-1">
                      <span className="text-amber-300">
                        {idx === 0 ? '★ ẢI MỞ ĐẦU' : `🔒 ẢI #${idx + 1}`}
                      </span>
                      <span className="text-sky-300">{lv.code}</span>
                    </div>
                    <div className="font-bold text-sm text-white">{lv.title}</div>
                    <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">{lv.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* =====================================================================
            3. BOTTOM ROW: 4 CARVED STONE PEDESTALS (Matches Reference Image 1:1)
           ===================================================================== */}
        <div className="w-full max-w-[780px] grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mt-3">
          {/* Pedestal 1: SHOP XU & VẬT PHẨM */}
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              onChangeTab('SHOP');
            }}
            className={`group relative py-2.5 px-3 rounded-xl border-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-[0_6px_0_#0f172a,0_10px_20px_rgba(0,0,0,0.75)] active:translate-y-0.5 ${
              activeTab === 'SHOP'
                ? 'bg-gradient-to-b from-[#475569] to-[#1e293b] border-amber-400'
                : 'bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] border-[#64748b] hover:border-amber-300'
            }`}
          >
            <div className="absolute top-0.5 left-4 right-4 h-1 bg-amber-300/40 rounded-full" />
            <GoldCoinsStackSvg className="w-10 h-10 group-hover:scale-110 transition-transform" />
            <span className="font-game font-extrabold text-[11px] sm:text-xs text-amber-100 leading-tight mt-1 uppercase">
              SHOP XU
              <br />& VẬT PHẨM
            </span>
          </button>

          {/* Pedestal 2: ĐẤU TRƯỜNG 4 NGƯỜI */}
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              onChangeTab('MULTI');
            }}
            className={`group relative py-2.5 px-3 rounded-xl border-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-[0_6px_0_#0f172a,0_10px_20px_rgba(0,0,0,0.75)] active:translate-y-0.5 ${
              activeTab === 'MULTI'
                ? 'bg-gradient-to-b from-[#475569] to-[#1e293b] border-amber-400'
                : 'bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] border-[#64748b] hover:border-amber-300'
            }`}
          >
            <div className="absolute top-0.5 left-4 right-4 h-1 bg-amber-300/40 rounded-full" />
            <GoldenTrophySvg className="w-10 h-10 group-hover:scale-110 transition-transform" />
            <span className="font-game font-extrabold text-[11px] sm:text-xs text-amber-100 leading-tight mt-1 uppercase">
              ĐẤU TRƯỜNG
              <br />4 NGƯỜI
            </span>
          </button>

          {/* Pedestal 3: NHIỀU BẢN ĐỒ HẤP DẪN */}
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              onChangeTab('MAPS');
            }}
            className={`group relative py-2.5 px-3 rounded-xl border-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-[0_6px_0_#0f172a,0_10px_20px_rgba(0,0,0,0.75)] active:translate-y-0.5 ${
              activeTab === 'MAPS'
                ? 'bg-gradient-to-b from-[#475569] to-[#1e293b] border-amber-400'
                : 'bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] border-[#64748b] hover:border-amber-300'
            }`}
          >
            <div className="absolute top-0.5 left-4 right-4 h-1 bg-amber-300/40 rounded-full" />
            <TreasureMapSvg className="w-10 h-10 group-hover:scale-110 transition-transform" />
            <span className="font-game font-extrabold text-[11px] sm:text-xs text-amber-100 leading-tight mt-1 uppercase">
              NHIỀU BẢN ĐỒ
              <br />HẤP DẪN
            </span>
          </button>

          {/* Pedestal 4: CHƠI MIỄN PHÍ CỰC VUI */}
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              if (activeTab !== 'AUTH') {
                onChangeTab('AUTH');
              } else {
                handleQuickGuest(undefined, false);
              }
            }}
            className={`group relative py-2.5 px-3 rounded-xl border-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-[0_6px_0_#0f172a,0_10px_20px_rgba(0,0,0,0.75)] active:translate-y-0.5 ${
              activeTab === 'AUTH'
                ? 'bg-gradient-to-b from-[#475569] to-[#1e293b] border-sky-400'
                : 'bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] border-[#64748b] hover:border-sky-300'
            }`}
          >
            <div className="absolute top-0.5 left-4 right-4 h-1 bg-sky-300/40 rounded-full" />
            <GlowingShieldSvg className="w-10 h-10 group-hover:scale-110 transition-transform" />
            <span className="font-game font-extrabold text-[11px] sm:text-xs text-amber-100 leading-tight mt-1 uppercase">
              CHƠI MIỄN PHÍ
              <br />CỰC VUI
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
