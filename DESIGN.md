# DESIGN.md — Pixel Bomber Adventure (16-Bit Diorama Edition)

## 1. Design Read & Register
- **Reading this as**: 16-bit Pixel Art Action-Arcade Game (`Bomberman` meets Fantasy RPG Diorama) for instant browser play, leaning authentic retro craftsmanship with zero AI-slop.
- **Register**: Product + Arcade Showcase (`DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 8`, `VISUAL_DENSITY: 7`).

## 2. Color System (Extracted from Reference Artwork)
- **HUD Background**: `#0d1526` (Deep Midnight Slate)
- **HUD Panel Inner**: `#162238` (Dark Navy Box)
- **HUD Border Outer / Inner**: `#2b426b` / `#47689b` (Crisp Steel-Blue Pixel Bevel)
- **Grass Tile Light / Dark**: `#5cb85c` / `#4ca64c` (Lush Meadow Checkerboard)
- **Stone Pillar (Indestructible)**: `#8c96a6` (Highlight `#b0bac9`, Shadow `#596273`)
- **Brick Wall (Destructible)**: `#d2603a` (Highlight `#ea855e`, Mortar `#7a2e18`)
- **Flower Bush (Destructible)**: `#2d7a36` (Leaf highlight `#4eb857`, Flowers `#fff59d` & `#ffffff`)
- **Blast Flame Core / Edge**: `#fffde7` → `#ffeb3b` → `#ff9800` → `#e65100`
- **River Water**: `#1e88e5` (Deep `#1565c0`, Foam `#bbdefb`)

## 3. Typography
- **Display / HUD Numbers**: `'Press Start 2P'`, `'VT323'`, monospace (`tabular-nums`)
- **UI Labels**: Crisp uppercase pixel typography with `2px 2px 0px #000000` hard drop shadow.
