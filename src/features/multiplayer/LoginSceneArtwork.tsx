import React from 'react';

/**
 * Custom Chibi & Pixel-Art Illustrated Assets modeled directly after the
 * Fantasy Castle Bomber Login Reference Art.
 */

export const ChibiBomberBoySvg: React.FC<{ className?: string }> = ({
  className = 'w-36 h-36',
}) => (
  <svg viewBox="0 0 180 180" className={className} fill="none">
    <defs>
      <radialGradient id="bombGradBoy" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="45%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
      <linearGradient id="capeGradBoy" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="65%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>
      <linearGradient id="hairGradBoy" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#9a5b32" />
        <stop offset="60%" stopColor="#6b3818" />
        <stop offset="100%" stopColor="#3e1e09" />
      </linearGradient>
    </defs>

    {/* Flowing Red Hero Cape */}
    <path
      d="M72 86 C35 72, 12 88, 6 116 C24 128, 48 128, 78 118 Z"
      fill="url(#capeGradBoy)"
      stroke="#270909"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path
      d="M68 92 C42 84, 24 94, 16 110"
      stroke="#f87171"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Legs & Boots (Jumping Dynamic Pose) */}
    <path
      d="M68 126 L50 146 L64 156 L82 136 Z"
      fill="#1e3a8a"
      stroke="#172554"
      strokeWidth="3.5"
    />
    <path
      d="M90 128 L104 148 L118 140 L102 120 Z"
      fill="#1e3a8a"
      stroke="#172554"
      strokeWidth="3.5"
    />
    {/* Left Boot */}
    <path
      d="M42 146 L62 162 C66 165, 72 160, 68 152 L54 138 Z"
      fill="#7c3f1c"
      stroke="#291306"
      strokeWidth="3.5"
    />
    {/* Right Boot */}
    <path
      d="M100 146 L122 152 C128 152, 128 142, 120 136 L106 134 Z"
      fill="#7c3f1c"
      stroke="#291306"
      strokeWidth="3.5"
    />

    {/* Blue Adventurer Tunic & Belt */}
    <rect
      x="66"
      y="88"
      width="44"
      height="42"
      rx="12"
      fill="#2563eb"
      stroke="#172554"
      strokeWidth="4"
    />
    <rect x="66" y="114" width="44" height="9" fill="#5c2d10" stroke="#291306" strokeWidth="2.5" />
    <rect x="83" y="112" width="12" height="12" rx="2" fill="#facc15" stroke="#713f12" strokeWidth="2" />

    {/* Right Arm Extended Back */}
    <path
      d="M68 94 C52 96, 42 104, 38 112"
      stroke="#fed7aa"
      strokeWidth="11"
      strokeLinecap="round"
    />
    <circle cx="37" cy="113" r="8" fill="#475569" stroke="#0f172a" strokeWidth="3" />

    {/* Red Neck Scarf */}
    <path
      d="M66 86 C78 96, 98 96, 112 86 L106 98 C90 104, 76 102, 66 94 Z"
      fill="#ef4444"
      stroke="#450a0a"
      strokeWidth="3"
    />

    {/* Chibi Head / Face */}
    <rect
      x="58"
      y="38"
      width="62"
      height="54"
      rx="24"
      fill="#ffedd5"
      stroke="#3b1d0a"
      strokeWidth="4"
    />
    {/* Rosy Cheeks */}
    <ellipse cx="69" cy="73" rx="5.5" ry="3.5" fill="#fb7185" opacity="0.65" />
    <ellipse cx="109" cy="73" rx="5.5" ry="3.5" fill="#fb7185" opacity="0.65" />

    {/* Determined Chibi Eyes & Eyebrows */}
    <ellipse cx="76" cy="64" rx="5.5" ry="7" fill="#1e1b4b" />
    <circle cx="74" cy="61" r="2.2" fill="#ffffff" />
    <ellipse cx="103" cy="64" rx="5.5" ry="7" fill="#1e1b4b" />
    <circle cx="101" cy="61" r="2.2" fill="#ffffff" />
    <path d="M68 53 L83 57" stroke="#431407" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M111 53 L96 57" stroke="#431407" strokeWidth="3.5" strokeLinecap="round" />

    {/* Excited Open Mouth */}
    <path
      d="M83 74 Q90 73 96 74 Q95 85 89 85 Q83 85 83 74 Z"
      fill="#991b1b"
      stroke="#450a0a"
      strokeWidth="2.5"
    />
    <path d="M85 75 L94 75" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="89.5" cy="81.5" rx="4" ry="2.5" fill="#fb7185" />

    {/* Spiky Chestnut Hair */}
    <path
      d="M52 58 C44 44, 54 26, 68 28 C72 16, 92 12, 102 22 C116 14, 132 28, 124 44 C134 50, 130 66, 120 64 C118 48, 110 42, 102 48 L96 38 L88 50 L80 38 L72 50 C64 42, 58 48, 52 58 Z"
      fill="url(#hairGradBoy)"
      stroke="#291306"
      strokeWidth="4"
      strokeLinejoin="round"
    />

    {/* Giant Glossy Black Bomb Held in Left Hand */}
    <g transform="translate(106, 74)">
      {/* Bomb Fuse */}
      <path
        d="M28 6 Q36 -8 46 -4"
        stroke="#d97706"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Glowing Fuse Spark */}
      <circle cx="48" cy="-4" r="11" fill="#f97316" opacity="0.45" />
      <path
        d="M48 -16 L51 -7 L60 -4 L51 -1 L48 8 L45 -1 L36 -4 L45 -7 Z"
        fill="#fde047"
        stroke="#ea580c"
        strokeWidth="1.5"
      />
      <circle cx="48" cy="-4" r="4" fill="#ffffff" />

      {/* Bomb Cap */}
      <rect
        x="19"
        y="4"
        width="16"
        height="7"
        rx="2"
        fill="#94a3b8"
        stroke="#0f172a"
        strokeWidth="2.5"
      />
      {/* Bomb Sphere */}
      <circle
        cx="27"
        cy="32"
        r="25"
        fill="url(#bombGradBoy)"
        stroke="#090d16"
        strokeWidth="4"
      />
      {/* Glossy Highlight */}
      <ellipse
        cx="18"
        cy="22"
        rx="7"
        ry="4.5"
        transform="rotate(-30 18 22)"
        fill="#e2e8f0"
        opacity="0.7"
      />
    </g>
  </svg>
);

export const ChibiBomberGirlSvg: React.FC<{ className?: string }> = ({
  className = 'w-28 h-28',
}) => (
  <svg viewBox="0 0 160 160" className={className} fill="none">
    <defs>
      <radialGradient id="bombGradGirl" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
    </defs>

    {/* Red Hooded Cape Body */}
    <path
      d="M52 84 C40 100, 42 128, 56 136 L118 136 C130 126, 130 100, 116 84 Z"
      fill="#dc2626"
      stroke="#3b0707"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    {/* White Dress Apron */}
    <path
      d="M72 90 L66 134 L106 134 L100 90 Z"
      fill="#fff7ed"
      stroke="#431407"
      strokeWidth="3"
    />
    {/* Sitting Boots */}
    <rect
      x="62"
      y="128"
      width="18"
      height="14"
      rx="6"
      fill="#7c2d12"
      stroke="#291306"
      strokeWidth="3"
    />
    <rect
      x="92"
      y="128"
      width="18"
      height="14"
      rx="6"
      fill="#7c2d12"
      stroke="#291306"
      strokeWidth="3"
    />

    {/* Red Riding Hood Outer */}
    <path
      d="M44 64 C40 30, 68 14, 92 18 C118 20, 134 42, 126 70 C122 84, 112 92, 86 92 C60 92, 48 80, 44 64 Z"
      fill="#ef4444"
      stroke="#3b0707"
      strokeWidth="4"
    />
    {/* Golden Hood Clasp */}
    <circle cx="86" cy="92" r="5.5" fill="#facc15" stroke="#713f12" strokeWidth="2.5" />

    {/* Face */}
    <rect
      x="58"
      y="40"
      width="56"
      height="46"
      rx="20"
      fill="#ffedd5"
      stroke="#431407"
      strokeWidth="3.5"
    />
    {/* Blonde Hair Bangs */}
    <path
      d="M56 54 C58 34, 76 30, 86 34 C98 30, 114 36, 116 54 C108 44, 100 42, 94 50 L86 38 L78 50 C70 42, 62 44, 56 54 Z"
      fill="#f59e0b"
      stroke="#78350f"
      strokeWidth="3"
    />

    {/* Cheerful Closed-Eye Smile (^ ◡ ^) */}
    <path
      d="M68 62 Q74 55 80 62"
      stroke="#431407"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M92 62 Q98 55 104 62"
      stroke="#431407"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
    <ellipse cx="66" cy="69" rx="5" ry="3" fill="#fb7185" opacity="0.7" />
    <ellipse cx="106" cy="69" rx="5" ry="3" fill="#fb7185" opacity="0.7" />
    {/* Happy Open Mouth */}
    <path
      d="M80 69 Q86 68 92 69 Q91 79 86 79 Q81 79 80 69 Z"
      fill="#be123c"
      stroke="#450a0a"
      strokeWidth="2"
    />

    {/* Bomb Held on the Left */}
    <g transform="translate(14, 72)">
      <path
        d="M24 6 Q18 -8 10 -4"
        stroke="#d97706"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="9" cy="-4" r="9" fill="#f97316" opacity="0.5" />
      <path
        d="M9 -13 L11 -6 L18 -4 L11 -2 L9 5 L7 -2 L0 -4 L7 -6 Z"
        fill="#fde047"
      />
      <circle
        cx="26"
        cy="30"
        r="21"
        fill="url(#bombGradGirl)"
        stroke="#090d16"
        strokeWidth="3.5"
      />
      <ellipse
        cx="19"
        cy="22"
        rx="6"
        ry="3.5"
        transform="rotate(-25 19 22)"
        fill="#e2e8f0"
        opacity="0.7"
      />
    </g>
  </svg>
);

export const GreenCubeMascotSvg: React.FC<{ className?: string }> = ({
  className = 'w-11 h-11',
}) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    {/* 3D Isometric Cube Slime matching left header icon */}
    <rect
      x="8"
      y="10"
      width="48"
      height="46"
      rx="10"
      fill="#22c55e"
      stroke="#052e16"
      strokeWidth="4"
    />
    <path d="M12 20 H52" stroke="#86efac" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
    <rect x="8" y="42" width="48" height="14" rx="6" fill="#15803d" opacity="0.65" />
    {/* Cute Pixel Eyes & Mouth */}
    <rect x="20" y="26" width="5" height="7" rx="2" fill="#052e16" />
    <rect x="39" y="26" width="5" height="7" rx="2" fill="#052e16" />
    <rect x="28" y="35" width="8" height="4" rx="2" fill="#052e16" />
  </svg>
);

export const GoldenKeySvg: React.FC<{ className?: string }> = ({
  className = 'w-11 h-11',
}) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <g transform="rotate(-35 32 32)">
      <circle
        cx="20"
        cy="32"
        r="13"
        fill="#facc15"
        stroke="#451a03"
        strokeWidth="4"
      />
      <circle cx="20" cy="32" r="5" fill="#78350f" />
      <rect
        x="31"
        y="28"
        width="25"
        height="8"
        rx="3"
        fill="#facc15"
        stroke="#451a03"
        strokeWidth="3.5"
      />
      <rect
        x="42"
        y="35"
        width="5"
        height="8"
        rx="1.5"
        fill="#f59e0b"
        stroke="#451a03"
        strokeWidth="2.5"
      />
      <rect
        x="50"
        y="35"
        width="5"
        height="10"
        rx="1.5"
        fill="#f59e0b"
        stroke="#451a03"
        strokeWidth="2.5"
      />
    </g>
  </svg>
);

export const Dice3DSvg: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 48 48" className={className} fill="none">
    <polygon
      points="24,4 44,14 44,34 24,44 4,34 4,14"
      fill="#f8fafc"
      stroke="#1e293b"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <polygon points="24,4 44,14 24,24 4,14" fill="#ffffff" />
    <polygon points="4,14 24,24 24,44 4,34" fill="#e2e8f0" />
    <polygon points="24,24 44,14 44,34 24,44" fill="#cbd5e1" />
    <polyline
      points="4,14 24,24 44,14"
      stroke="#94a3b8"
      strokeWidth="2"
      fill="none"
    />
    <line x1="24" y1="24" x2="24" y2="44" stroke="#94a3b8" strokeWidth="2" />
    {/* Pips */}
    <circle cx="24" cy="14" r="3" fill="#ef4444" />
    <circle cx="11" cy="26" r="2.2" fill="#1e293b" />
    <circle cx="17" cy="33" r="2.2" fill="#1e293b" />
    <circle cx="30" cy="24" r="2.2" fill="#1e293b" />
    <circle cx="34" cy="30" r="2.2" fill="#ef4444" />
    <circle cx="38" cy="35" r="2.2" fill="#1e293b" />
  </svg>
);

export const RunningHeroIconSvg: React.FC<{ className?: string }> = ({
  className = 'w-11 h-11',
}) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    {/* Red Cape */}
    <path
      d="M24 34 L6 38 L12 48 L28 44 Z"
      fill="#ef4444"
      stroke="#270909"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Head */}
    <rect
      x="24"
      y="14"
      width="24"
      height="20"
      rx="8"
      fill="#ffedd5"
      stroke="#291306"
      strokeWidth="3"
    />
    {/* Spiky Hair */}
    <path
      d="M20 22 C20 10, 32 6, 42 10 C50 10, 54 18, 48 24 C44 18, 30 18, 20 22 Z"
      fill="#7c3f1c"
      stroke="#291306"
      strokeWidth="3"
    />
    {/* Eyes */}
    <circle cx="33" cy="24" r="2.2" fill="#1e1b4b" />
    <circle cx="42" cy="24" r="2.2" fill="#1e1b4b" />
    {/* Blue Tunic & Running Legs */}
    <rect
      x="26"
      y="34"
      width="18"
      height="14"
      rx="4"
      fill="#2563eb"
      stroke="#172554"
      strokeWidth="3"
    />
    <path d="M26 48 L18 56" stroke="#7c3f1c" strokeWidth="5" strokeLinecap="round" />
    <path d="M42 48 L50 56" stroke="#7c3f1c" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

export const CrossedSwordsSvg: React.FC<{ className?: string }> = ({
  className = 'w-9 h-9',
}) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    {/* Sword 1 */}
    <path
      d="M12 12 L22 14 L50 42 L42 50 L14 22 Z"
      fill="#60a5fa"
      stroke="#0f172a"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <path d="M38 52 L52 38" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />
    <path d="M46 46 L54 54" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />

    {/* Sword 2 */}
    <path
      d="M52 12 L42 14 L14 42 L22 50 L50 22 Z"
      fill="#93c5fd"
      stroke="#0f172a"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <path d="M12 38 L26 52" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />
    <path d="M18 46 L10 54" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

export const GiftBoxSvg: React.FC<{ className?: string }> = ({
  className = 'w-9 h-9',
}) => (
  <svg viewBox="0 0 56 56" className={className} fill="none">
    <rect
      x="10"
      y="22"
      width="36"
      height="26"
      rx="4"
      fill="#ef4444"
      stroke="#450a0a"
      strokeWidth="3"
    />
    <rect
      x="7"
      y="15"
      width="42"
      height="9"
      rx="3"
      fill="#dc2626"
      stroke="#450a0a"
      strokeWidth="3"
    />
    <rect x="24" y="15" width="8" height="33" fill="#facc15" stroke="#713f12" strokeWidth="2" />
    <rect x="10" y="31" width="36" height="7" fill="#facc15" stroke="#713f12" strokeWidth="2" />
    <path
      d="M28 15 C18 5, 12 12, 22 15 C28 15, 38 5, 34 15"
      stroke="#facc15"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

export const WallTorchSvg: React.FC<{ className?: string }> = ({
  className = 'w-12 h-24',
}) => (
  <svg viewBox="0 0 60 120" className={className} fill="none">
    {/* Glow Aura */}
    <circle cx="30" cy="34" r="28" fill="#f59e0b" opacity="0.32" />
    {/* Outer Flame */}
    <path
      d="M30 6 C46 20, 50 40, 38 52 C32 58, 28 58, 22 52 C10 40, 14 20, 30 6 Z"
      fill="#f97316"
      stroke="#7c2d12"
      strokeWidth="2.5"
    />
    {/* Inner Flame */}
    <path
      d="M30 16 C40 26, 42 40, 34 48 C30 52, 26 48, 26 48 C18 40, 20 26, 30 16 Z"
      fill="#facc15"
    />
    <ellipse cx="30" cy="38" rx="5" ry="8" fill="#fef08a" />
    {/* Iron Torch Bowl & Handle */}
    <rect
      x="16"
      y="50"
      width="28"
      height="8"
      rx="3"
      fill="#475569"
      stroke="#0f172a"
      strokeWidth="2.5"
    />
    <path
      d="M22 58 L26 98 L34 98 L38 58 Z"
      fill="#78350f"
      stroke="#291306"
      strokeWidth="3"
    />
    <rect
      x="20"
      y="74"
      width="20"
      height="7"
      rx="2"
      fill="#334155"
      stroke="#0f172a"
      strokeWidth="2.5"
    />
  </svg>
);

export const GoldCoinsStackSvg: React.FC<{ className?: string }> = ({
  className = 'w-11 h-11',
}) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    {/* Back Stack */}
    {[38, 30, 22, 14].map((y, i) => (
      <g key={i}>
        <ellipse
          cx="24"
          cy={y}
          rx="13"
          ry="6"
          fill="#f59e0b"
          stroke="#451a03"
          strokeWidth="2.5"
        />
        <ellipse cx="24" cy={y - 1.5} rx="10" ry="4" fill="#fde047" />
      </g>
    ))}
    {/* Front Stack */}
    {[46, 38, 30].map((y, i) => (
      <g key={i}>
        <ellipse
          cx="41"
          cy={y}
          rx="13"
          ry="6"
          fill="#d97706"
          stroke="#451a03"
          strokeWidth="2.5"
        />
        <ellipse cx="41" cy={y - 1.5} rx="10" ry="4" fill="#facc15" />
      </g>
    ))}
  </svg>
);

export const GoldenTrophySvg: React.FC<{ className?: string }> = ({
  className = 'w-11 h-11',
}) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <path
      d="M18 16 H46 V28 C46 38, 38 42, 32 42 C26 42, 18 38, 18 28 Z"
      fill="#facc15"
      stroke="#451a03"
      strokeWidth="3.5"
    />
    <path
      d="M18 20 H10 C10 30, 14 34, 19 34"
      stroke="#f59e0b"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M46 20 H54 C54 30, 50 34, 45 34"
      stroke="#f59e0b"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <rect x="28" y="42" width="8" height="8" fill="#d97706" stroke="#451a03" strokeWidth="3" />
    <rect
      x="20"
      y="50"
      width="24"
      height="7"
      rx="2"
      fill="#78350f"
      stroke="#291306"
      strokeWidth="3"
    />
  </svg>
);

export const TreasureMapSvg: React.FC<{ className?: string }> = ({
  className = 'w-11 h-11',
}) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <path
      d="M12 14 L26 18 L38 14 L52 18 V50 L38 46 L26 50 L12 46 Z"
      fill="#fde68a"
      stroke="#451a03"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <path
      d="M20 38 Q28 24 36 32 T44 24"
      stroke="#dc2626"
      strokeWidth="3"
      strokeDasharray="4 3"
      strokeLinecap="round"
    />
    <path d="M40 20 L48 28 M48 20 L40 28" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

export const GlowingShieldSvg: React.FC<{ className?: string }> = ({
  className = 'w-11 h-11',
}) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <path
      d="M32 8 L50 16 V32 C50 44, 41 52, 32 56 C23 52, 14 44, 14 32 V16 Z"
      fill="#cbd5e1"
      stroke="#0f172a"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <path
      d="M32 13 L45 19 V31 C45 40, 38 47, 32 50 C26 47, 19 40, 19 31 V19 Z"
      fill="#0ea5e9"
      stroke="#0369a1"
      strokeWidth="2.5"
    />
    <path d="M32 16 V47" stroke="#7dd3fc" strokeWidth="2.5" opacity="0.75" />
    <path d="M21 29 H43" stroke="#7dd3fc" strokeWidth="2.5" opacity="0.75" />
  </svg>
);

export const CuteBlueSlimeSvg: React.FC<{ className?: string }> = ({
  className = 'w-20 h-20',
}) => (
  <svg viewBox="0 0 100 90" className={className} fill="none">
    <defs>
      <radialGradient id="blueSlimeGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="50%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </radialGradient>
    </defs>
    <path
      d="M12 56 C12 26, 30 14, 50 14 C70 14, 88 26, 88 56 C88 74, 74 82, 50 82 C26 82, 12 74, 12 56 Z"
      fill="url(#blueSlimeGrad)"
      stroke="#0f172a"
      strokeWidth="4"
    />
    <ellipse cx="32" cy="30" rx="10" ry="5" transform="rotate(-20 32 30)" fill="#e0f2fe" opacity="0.8" />
    <circle cx="36" cy="52" r="5" fill="#0f172a" />
    <circle cx="34" cy="50" r="1.8" fill="#ffffff" />
    <circle cx="64" cy="52" r="5" fill="#0f172a" />
    <circle cx="62" cy="50" r="1.8" fill="#ffffff" />
    <ellipse cx="26" cy="58" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.6" />
    <ellipse cx="74" cy="58" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.6" />
    <path
      d="M44 58 Q50 66 56 58 Z"
      fill="#f43f5e"
      stroke="#0f172a"
      strokeWidth="2.5"
    />
  </svg>
);
