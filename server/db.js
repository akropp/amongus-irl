// In-memory data store
const store = {
  games: new Map(),
  rooms: new Map(),
  players: new Map()
};

export const gameQueries = {
  createGame: (code, maxPlayers) => {
    store.games.set(code, {
      code,
      maxPlayers,
      phase: 'lobby',
      createdAt: new Date()
    });
    return store.games.get(code);
  },

  addRoom: (gameCode, room) => {
    const rooms = store.rooms.get(gameCode) || [];
    rooms.push(room);
    store.rooms.set(gameCode, rooms);
    return rooms;
  },

  getGame: (code) => store.games.get(code),

  getRooms: (gameCode) => store.rooms.get(gameCode) || [],

  addPlayer: (id, gameCode, name, role) => {
    const player = { id, gameCode, name, role, isAlive: true };
    const gamePlayers = store.players.get(gameCode) || [];
    gamePlayers.push(player);
    store.players.set(gameCode, gamePlayers);
    return player;
  },

  getPlayers: (gameCode) => store.players.get(gameCode) || [],

  removePlayer: (id) => {
    for (const [gameCode, players] of store.players.entries()) {
      const filtered = players.filter(p => p.id !== id);
      if (filtered.length !== players.length) {
        store.players.set(gameCode, filtered);
        return filtered;
      }
    }
    return [];
  },

  updateGamePhase: (phase, gameCode) => {
    const game = store.games.get(gameCode);
    if (game) {
      game.phase = phase;
      store.games.set(gameCode, game);
    }
  },

  getGameWithDetails: (code) => {
    const game = store.games.get(code);
    if (!game) return null;

    return {
      ...game,
      rooms: store.rooms.get(code) || [],
      players: store.players.get(code) || []
    };
  }
};