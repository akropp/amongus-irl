import Database from 'better-sqlite3';

const db = new Database('games.db');

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    code TEXT PRIMARY KEY,
    maxPlayers INTEGER,
    phase TEXT DEFAULT 'lobby',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS game_rooms (
    gameCode TEXT,
    room TEXT,
    FOREIGN KEY (gameCode) REFERENCES games(code),
    PRIMARY KEY (gameCode, room)
  );

  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    gameCode TEXT,
    name TEXT,
    role TEXT DEFAULT 'unassigned',
    isAlive BOOLEAN DEFAULT 1,
    FOREIGN KEY (gameCode) REFERENCES games(code)
  );
`);

export const gameQueries = {
  createGame: db.prepare(`
    INSERT INTO games (code, maxPlayers) VALUES (?, ?)
  `),

  addRoom: db.prepare(`
    INSERT INTO game_rooms (gameCode, room) VALUES (?, ?)
  `),

  getGame: db.prepare(`
    SELECT * FROM games WHERE code = ?
  `),

  getRooms: db.prepare(`
    SELECT room FROM game_rooms WHERE gameCode = ?
  `),

  addPlayer: db.prepare(`
    INSERT INTO players (id, gameCode, name, role) VALUES (?, ?, ?, ?)
  `),

  getPlayers: db.prepare(`
    SELECT * FROM players WHERE gameCode = ?
  `),

  removePlayer: db.prepare(`
    DELETE FROM players WHERE id = ?
  `),

  updateGamePhase: db.prepare(`
    UPDATE games SET phase = ? WHERE code = ?
  `),

  getGameWithDetails: db.prepare(`
    SELECT 
      g.*,
      json_group_array(DISTINCT r.room) as rooms,
      json_group_array(json_object(
        'id', p.id,
        'name', p.name,
        'role', p.role,
        'isAlive', p.isAlive
      )) as players
    FROM games g
    LEFT JOIN game_rooms r ON g.code = r.gameCode
    LEFT JOIN players p ON g.code = p.gameCode
    WHERE g.code = ?
    GROUP BY g.code
  `)
};