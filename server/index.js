import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import express from 'express';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// 1. Initialize SQLite Database (Node built-in node:sqlite)
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'pixel_bomber.sqlite');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    is_guest INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 500,
    elo_rating INTEGER DEFAULT 1000,
    wins INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    equipped_skin TEXT DEFAULT 'KNIGHT_RED',
    equipped_flame TEXT DEFAULT 'CLASSIC_ORANGE',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_category TEXT NOT NULL,
    item_code TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_category, item_code)
  );

  CREATE TABLE IF NOT EXISTS leaderboards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    level_code TEXT NOT NULL,
    score INTEGER NOT NULL,
    time_remaining_sec INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS active_rooms (
    room_code TEXT PRIMARY KEY,
    host_username TEXT NOT NULL,
    host_display_name TEXT NOT NULL,
    mode TEXT DEFAULT 'PVP_BATTLE',
    level_code TEXT DEFAULT '1-1',
    bot_count INTEGER DEFAULT 0,
    in_progress INTEGER DEFAULT 0,
    members_json TEXT DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Clear stale rooms from previous process boot
db.exec('DELETE FROM active_rooms');

// Seed initial leaderboard if empty
const countRow = db.prepare('SELECT COUNT(*) as cnt FROM leaderboards').get();
if (!countRow || countRow.cnt === 0) {
  const seedStmt = db.prepare(
    'INSERT INTO leaderboards (player_name, level_code, score, time_remaining_sec) VALUES (?, ?, ?, ?)'
  );
  seedStmt.run('THAY_DUOC_PRO', '3-2', 9850, 145);
  seedStmt.run('BOMBER_KING', '2-3', 6400, 118);
  seedStmt.run('GHOST_HUNTER', '1-3', 4250, 110);
  seedStmt.run('PIXEL_HERO', '1-1', 2150, 135);
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(`pixel_salt_${password}`).digest('hex');
}

function buildUserResponse(userRow) {
  const invRows = db
    .prepare('SELECT item_category, item_code FROM user_inventory WHERE user_id = ?')
    .all(userRow.id);

  const unlockedSkins = new Set(['KNIGHT_RED']);
  const unlockedFlames = new Set(['CLASSIC_ORANGE']);

  for (const r of invRows) {
    if (r.item_category === 'SKIN') unlockedSkins.add(r.item_code);
    if (r.item_category === 'FLAME') unlockedFlames.add(r.item_code);
  }

  return {
    id: userRow.id,
    username: userRow.username,
    displayName: userRow.display_name,
    isGuest: Boolean(userRow.is_guest),
    coins: userRow.coins,
    eloRating: userRow.elo_rating,
    wins: userRow.wins,
    matchesPlayed: userRow.matches_played,
    equippedSkin: userRow.equipped_skin,
    equippedFlame: userRow.equipped_flame,
    unlockedSkins: Array.from(unlockedSkins),
    unlockedFlames: Array.from(unlockedFlames),
  };
}

// 2. Auth Endpoints (Register, Login, Quick Play Guest)
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password, displayName } = req.body || {};
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();
    const cleanDisplay = String(displayName || username || '').trim().slice(0, 18).toUpperCase();

    if (cleanUser.length < 3 || cleanPass.length < 3) {
      return res
        .status(400)
        .json({ success: false, error: 'Tên tài khoản và mật khẩu cần ít nhất 3 ký tự!' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUser);
    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: 'Tài khoản này đã tồn tại! Vui lòng chuyển sang Đăng Nhập.' });
    }

    const passHash = hashPassword(cleanPass);
    const info = db
      .prepare(
        `INSERT INTO users (username, password_hash, display_name, is_guest, coins, elo_rating)
         VALUES (?, ?, ?, 0, 600, 1000)`
      )
      .run(cleanUser, passHash, cleanDisplay || cleanUser.toUpperCase());

    const userId = Number(info.lastInsertRowid);
    db.prepare(
      'INSERT OR IGNORE INTO user_inventory (user_id, item_category, item_code) VALUES (?, ?, ?)'
    ).run(userId, 'SKIN', 'KNIGHT_RED');
    db.prepare(
      'INSERT OR IGNORE INTO user_inventory (user_id, item_category, item_code) VALUES (?, ?, ?)'
    ).run(userId, 'FLAME', 'CLASSIC_ORANGE');

    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    return res.json({ success: true, data: buildUserResponse(userRow) });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, error: 'Lỗi máy chủ khi đăng ký tài khoản' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    const userRow = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUser);
    if (!userRow || userRow.password_hash !== hashPassword(cleanPass)) {
      return res.status(401).json({ success: false, error: 'Sai tên đăng nhập hoặc mật khẩu!' });
    }

    return res.json({ success: true, data: buildUserResponse(userRow) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Lỗi máy chủ khi đăng nhập' });
  }
});

app.post('/api/auth/guest', (req, res) => {
  try {
    const { displayName } = req.body || {};
    const cleanDisplay =
      String(displayName || 'KHACH_PRO')
        .trim()
        .slice(0, 16)
        .toUpperCase() || 'KHACH_PRO';
    const guestUsername = `guest_${Date.now()}_${Math.floor(Math.random() * 999)}`;

    const info = db
      .prepare(
        `INSERT INTO users (username, password_hash, display_name, is_guest, coins, elo_rating)
         VALUES (?, 'guest', ?, 1, 400, 1000)`
      )
      .run(guestUsername, cleanDisplay);

    const userId = Number(info.lastInsertRowid);
    db.prepare(
      'INSERT OR IGNORE INTO user_inventory (user_id, item_category, item_code) VALUES (?, ?, ?)'
    ).run(userId, 'SKIN', 'KNIGHT_RED');
    db.prepare(
      'INSERT OR IGNORE INTO user_inventory (user_id, item_category, item_code) VALUES (?, ?, ?)'
    ).run(userId, 'FLAME', 'CLASSIC_ORANGE');

    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    return res.json({ success: true, data: buildUserResponse(userRow) });
  } catch (err) {
    console.error('Guest auth error:', err);
    return res.status(500).json({ success: false, error: 'Không thể khởi tạo phiên Chơi Nhanh' });
  }
});

// 3. Coin Shop Endpoints (Buy & Equip Skins / Flame Colors)
const SHOP_PRICES = {
  SKIN: {
    KNIGHT_RED: 0,
    PALADIN_GOLD: 250,
    SHADOW_NINJA: 350,
    ARCANE_MAGE: 450,
  },
  FLAME: {
    CLASSIC_ORANGE: 0,
    ICE_BLUE: 200,
    SHADOW_PURPLE: 300,
    EMERALD_TOXIC: 350,
    GOLDEN_SUN: 500,
  },
};

app.post('/api/shop/buy', (req, res) => {
  try {
    const { userId, category, itemCode } = req.body || {};
    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(userId));
    if (!userRow) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người chơi' });
    }

    const price = SHOP_PRICES[category]?.[itemCode];
    if (typeof price !== 'number') {
      return res.status(400).json({ success: false, error: 'Vật phẩm không hợp lệ' });
    }

    const alreadyOwned = db
      .prepare(
        'SELECT id FROM user_inventory WHERE user_id = ? AND item_category = ? AND item_code = ?'
      )
      .get(userRow.id, category, itemCode);

    if (!alreadyOwned) {
      if (userRow.coins < price) {
        return res.status(400).json({
          success: false,
          error: `Chưa đủ Xu! Cần ${price} Xu (Hiện có ${userRow.coins} Xu).`,
        });
      }
      db.prepare('UPDATE users SET coins = coins - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
        price,
        userRow.id
      );
      db.prepare(
        'INSERT OR IGNORE INTO user_inventory (user_id, item_category, item_code) VALUES (?, ?, ?)'
      ).run(userRow.id, category, itemCode);
    }

    if (category === 'SKIN') {
      db.prepare('UPDATE users SET equipped_skin = ? WHERE id = ?').run(itemCode, userRow.id);
    } else if (category === 'FLAME') {
      db.prepare('UPDATE users SET equipped_flame = ? WHERE id = ?').run(itemCode, userRow.id);
    }

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userRow.id);
    return res.json({ success: true, data: buildUserResponse(updatedUser) });
  } catch (err) {
    console.error('Shop buy error:', err);
    return res.status(500).json({ success: false, error: 'Lỗi giao dịch Cửa Hàng' });
  }
});

app.post('/api/user/reward', (req, res) => {
  try {
    const { userId, coinsEarned, isWin } = req.body || {};
    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(userId));
    if (!userRow) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản' });
    }

    const addCoins = Math.max(0, Math.min(2000, Math.floor(Number(coinsEarned) || 0)));
    const addWins = isWin ? 1 : 0;
    const addElo = isWin ? 25 : 0;

    db.prepare(
      `UPDATE users
       SET coins = coins + ?,
           wins = wins + ?,
           matches_played = matches_played + 1,
           elo_rating = elo_rating + ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(addCoins, addWins, addElo, userRow.id);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userRow.id);
    return res.json({ success: true, data: buildUserResponse(updated) });
  } catch (err) {
    console.error('Reward error:', err);
    return res.status(500).json({ success: false, error: 'Không thể cập nhật thưởng' });
  }
});

// 4. Leaderboard Endpoints
app.get('/api/leaderboard', (_req, res) => {
  try {
    const rows = db
      .prepare('SELECT * FROM leaderboards ORDER BY score DESC LIMIT 15')
      .all();
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Leaderboard get error:', err);
    return res.json({ success: true, data: [] });
  }
});

app.post('/api/leaderboard', (req, res) => {
  try {
    const { player_name, level_code, score, time_remaining_sec } = req.body || {};
    if (!player_name || typeof score !== 'number') {
      return res.status(400).json({ success: false, error: 'Dữ liệu điểm số không hợp lệ' });
    }

    db.prepare(
      `INSERT INTO leaderboards (player_name, level_code, score, time_remaining_sec)
       VALUES (?, ?, ?, ?)`
    ).run(
      String(player_name).slice(0, 24),
      String(level_code || '1-1'),
      Math.max(0, Math.floor(score)),
      Math.max(0, Math.floor(time_remaining_sec || 0))
    );

    const rows = db
      .prepare('SELECT * FROM leaderboards ORDER BY score DESC LIMIT 15')
      .all();
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Leaderboard post error:', err);
    return res.status(500).json({ success: false, error: 'Lỗi lưu bảng xếp hạng' });
  }
});

// 5. HTTP + WebSocket Server for Real-Time 2-4 Player Rooms + SQLite Room Directory
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

/**
 * Room structure:
 * {
 *   code: string,
 *   hostUsername: string,
 *   hostDisplayName: string,
 *   mode: 'PVP_BATTLE' | 'COOP_STAGE',
 *   levelCode: string,
 *   botCount: number, // 0, 1, 2, or 3 (Default: 0 — no bots unless chosen!)
 *   inProgress: boolean,
 *   players: Map<ws, { slot: 'P1'|'P2'|'P3'|'P4', username, displayName, skin, flameColor }>
 * }
 */
const rooms = new Map();

function getPublicRoomsList() {
  const list = [];
  for (const room of rooms.values()) {
    const members = Array.from(room.players.values());
    if (members.length === 0) continue;
    const p1 = members.find((m) => m.slot === 'P1') || members[0];
    list.push({
      roomCode: room.code,
      hostUsername: p1?.username || room.hostUsername || 'host',
      hostDisplayName: p1?.displayName || room.hostDisplayName || 'CHỦ PHÒNG',
      mode: room.mode,
      levelCode: room.levelCode,
      botCount: room.botCount,
      inProgress: room.inProgress,
      playerCount: members.length,
      members,
    });
  }
  return list;
}

function syncRoomToSqlite(roomCode) {
  try {
    const room = rooms.get(roomCode);
    if (!room || room.players.size === 0) {
      db.prepare('DELETE FROM active_rooms WHERE room_code = ?').run(roomCode);
      return;
    }
    const members = Array.from(room.players.values());
    const p1 = members.find((m) => m.slot === 'P1') || members[0];
    db.prepare(
      `INSERT INTO active_rooms (
        room_code, host_username, host_display_name, mode, level_code, bot_count, in_progress, members_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(room_code) DO UPDATE SET
        host_username = excluded.host_username,
        host_display_name = excluded.host_display_name,
        mode = excluded.mode,
        level_code = excluded.level_code,
        bot_count = excluded.bot_count,
        in_progress = excluded.in_progress,
        members_json = excluded.members_json,
        updated_at = CURRENT_TIMESTAMP`
    ).run(
      room.code,
      p1?.username || room.hostUsername || 'host',
      p1?.displayName || room.hostDisplayName || 'CHỦ PHÒNG',
      room.mode,
      room.levelCode,
      room.botCount,
      room.inProgress ? 1 : 0,
      JSON.stringify(members)
    );
  } catch (err) {
    console.error('SQLite active_rooms sync error:', err);
  }
}

function broadcastRoomsList() {
  const payload = JSON.stringify({
    type: 'ROOMS_LIST',
    rooms: getPublicRoomsList(),
  });
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

app.get('/api/rooms', (_req, res) => {
  return res.json({
    success: true,
    data: getPublicRoomsList(),
  });
});

function broadcastRoomState(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) {
    syncRoomToSqlite(roomCode);
    broadcastRoomsList();
    return;
  }
  const members = Array.from(room.players.values());
  const p1 = members.find((m) => m.slot === 'P1') || members[0];
  const payload = JSON.stringify({
    type: 'ROOM_UPDATE',
    roomCode: room.code,
    hostUsername: p1?.username || room.hostUsername,
    hostDisplayName: p1?.displayName || room.hostDisplayName,
    mode: room.mode,
    levelCode: room.levelCode,
    botCount: room.botCount,
    inProgress: room.inProgress,
    members,
  });

  for (const clientWs of room.players.keys()) {
    if (clientWs.readyState === 1) {
      clientWs.send(payload);
    }
  }
  syncRoomToSqlite(roomCode);
  broadcastRoomsList();
}

function broadcastToRoom(roomCode, senderWs, messageObj, includeSender = false) {
  const room = rooms.get(roomCode);
  if (!room) return;
  const raw = JSON.stringify(messageObj);
  for (const clientWs of room.players.keys()) {
    if (!includeSender && clientWs === senderWs) continue;
    if (clientWs.readyState === 1) {
      clientWs.send(raw);
    }
  }
}

function removeClientFromRoom(ws) {
  const roomCode = ws.roomCode;
  if (!roomCode) return;
  const room = rooms.get(roomCode);
  if (!room) return;
  const leavingSlot = ws.playerSlot;
  room.players.delete(ws);
  ws.roomCode = null;
  ws.playerSlot = null;
  if (room.players.size === 0) {
    rooms.delete(roomCode);
    syncRoomToSqlite(roomCode);
    broadcastRoomsList();
  } else {
    broadcastToRoom(
      roomCode,
      ws,
      {
        type: 'PLAYER_LEFT',
        slot: leavingSlot,
      },
      true
    );
    broadcastRoomState(roomCode);
  }
}

wss.on('connection', (ws) => {
  // Immediately send the current list of active rooms upon connection
  ws.send(
    JSON.stringify({
      type: 'ROOMS_LIST',
      rooms: getPublicRoomsList(),
    })
  );

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(String(data));

      if (msg.type === 'LIST_ROOMS') {
        ws.send(
          JSON.stringify({
            type: 'ROOMS_LIST',
            rooms: getPublicRoomsList(),
          })
        );
        return;
      }

      if (msg.type === 'LEAVE_ROOM') {
        removeClientFromRoom(ws);
        ws.send(JSON.stringify({ type: 'LEFT_ROOM' }));
        return;
      }

      if (msg.type === 'CREATE_OR_JOIN_ROOM') {
        const requestedCode = String(msg.roomCode || '')
          .trim()
          .toUpperCase()
          .slice(0, 6);
        const roomCode =
          requestedCode || String(Math.floor(1000 + Math.random() * 9000));
        const action = msg.action || 'AUTO'; // 'CREATE' | 'JOIN' | 'AUTO'
        const cleanUsername = String(msg.username || '')
          .trim()
          .toLowerCase();
        const cleanDisplayName = String(
          msg.displayName || msg.username || 'BOMBER'
        ).slice(0, 14);

        // If ws is already in a DIFFERENT room, remove from old room first
        if (ws.roomCode && ws.roomCode !== roomCode) {
          removeClientFromRoom(ws);
        }

        let room = rooms.get(roomCode);
        let isNewRoom = false;

        if (action === 'JOIN' && !room) {
          ws.send(
            JSON.stringify({
              type: 'ROOM_ERROR',
              error: `Phòng #${roomCode} chưa tồn tại! Hãy bấm "TẠO PHÒNG MỚI" hoặc chọn phòng đang mở bên dưới.`,
            })
          );
          return;
        }

        if (!room) {
          isNewRoom = true;
          room = {
            code: roomCode,
            hostUsername: cleanUsername || 'host',
            hostDisplayName: cleanDisplayName,
            mode: msg.mode || 'PVP_BATTLE',
            levelCode: msg.levelCode || '1-1',
            botCount:
              typeof msg.botCount === 'number'
                ? Math.max(0, Math.min(3, Math.floor(msg.botCount)))
                : 0,
            inProgress: false,
            players: new Map(),
          };
          rooms.set(roomCode, room);
        } else if (typeof msg.botCount === 'number' && room.players.size === 0) {
          room.botCount = Math.max(0, Math.min(3, Math.floor(msg.botCount)));
        }

        // Check if this exact socket or same username is already in this room
        let existingSlot = null;
        if (room.players.has(ws)) {
          existingSlot = room.players.get(ws).slot;
        } else if (cleanUsername && !cleanUsername.startsWith('guest_')) {
          for (const [oldWs, info] of room.players.entries()) {
            if (info.username && info.username === cleanUsername) {
              existingSlot = info.slot;
              room.players.delete(oldWs);
              oldWs.roomCode = null;
              oldWs.playerSlot = null;
              break;
            }
          }
        }

        const usedSlots = new Set(
          Array.from(room.players.values()).map((p) => p.slot)
        );
        const availableSlot =
          existingSlot ||
          ['P1', 'P2', 'P3', 'P4'].find((s) => !usedSlots.has(s));

        if (!availableSlot) {
          ws.send(
            JSON.stringify({
              type: 'ROOM_ERROR',
              error: `Phòng #${roomCode} đã đủ 4/4 người chơi!`,
            })
          );
          return;
        }

        const playerInfo = {
          slot: availableSlot,
          username: cleanUsername || availableSlot.toLowerCase(),
          displayName: cleanDisplayName,
          skin: msg.skin || 'KNIGHT_RED',
          flameColor: msg.flameColor || 'CLASSIC_ORANGE',
        };

        room.players.set(ws, playerInfo);
        ws.roomCode = roomCode;
        ws.playerSlot = availableSlot;

        const members = Array.from(room.players.values());
        const p1 = members.find((m) => m.slot === 'P1') || members[0];

        ws.send(
          JSON.stringify({
            type: 'JOINED_ROOM',
            roomCode,
            assignedSlot: availableSlot,
            isNewRoom,
            hostUsername: p1?.username || room.hostUsername,
            hostDisplayName: p1?.displayName || room.hostDisplayName,
            botCount: room.botCount,
            inProgress: room.inProgress,
            members,
          })
        );
        broadcastRoomState(roomCode);

        // If the room host is already inside the map waiting for players, let the joiner enter immediately!
        if (room.inProgress) {
          ws.send(
            JSON.stringify({
              type: 'MATCH_STARTED',
              roomCode: room.code,
              mode: room.mode,
              levelCode: room.levelCode,
              botCount: room.botCount,
              members,
            })
          );
        }
        return;
      }

      if (msg.type === 'CONFIGURE_ROOM' && ws.roomCode) {
        const room = rooms.get(ws.roomCode);
        if (room) {
          if (msg.mode) room.mode = msg.mode;
          if (msg.levelCode) room.levelCode = msg.levelCode;
          if (typeof msg.botCount === 'number') {
            room.botCount = Math.max(0, Math.min(3, Math.floor(msg.botCount)));
          }
          broadcastRoomState(ws.roomCode);
        }
        return;
      }

      if (msg.type === 'START_ROOM_MATCH' && ws.roomCode) {
        const room = rooms.get(ws.roomCode);
        if (room) {
          if (typeof msg.botCount === 'number') {
            room.botCount = Math.max(0, Math.min(3, Math.floor(msg.botCount)));
          }
          room.inProgress = true;
          const members = Array.from(room.players.values());
          syncRoomToSqlite(ws.roomCode);
          broadcastRoomsList();
          broadcastToRoom(
            ws.roomCode,
            ws,
            {
              type: 'MATCH_STARTED',
              roomCode: room.code,
              mode: room.mode,
              levelCode: room.levelCode,
              botCount: room.botCount,
              members,
            },
            true
          );
        }
        return;
      }

      if (
        (msg.type === 'PLAYER_SYNC' ||
          msg.type === 'BOMB_ACTION' ||
          msg.type === 'EMOTE_TRIGGER') &&
        ws.roomCode
      ) {
        broadcastToRoom(ws.roomCode, ws, {
          ...msg,
          slot: ws.playerSlot,
        });
      }
    } catch {
      // Ignore malformed WS packets
    }
  });

  ws.on('close', () => {
    removeClientFromRoom(ws);
  });
});

server.listen(PORT, () => {
  console.log(`Pixel Bomber SQLite + WebSocket Server running at http://localhost:${PORT}`);
});
