import { EventEmitter } from 'events';

class GameManager extends EventEmitter {
  constructor() {
    super();
    this.activeGames = new Map();
    this.disconnectedPlayers = new Map(); // Store disconnected players with timestamps
    this.RECONNECT_TIMEOUT = 30000; // 30 seconds grace period
  }

  createGame(code, maxPlayers, rooms) {
    console.log('GameManager: Creating game with code:', code);
    
    try {
      const game = {
        code,
        maxPlayers: parseInt(maxPlayers, 10),
        rooms: rooms || [],
        players: [],
        phase: 'lobby',
        createdAt: new Date()
      };
      
      this.activeGames.set(code, game);
      console.log('GameManager: Game created successfully:', game);
      return game;
    } catch (error) {
      console.error('GameManager: Error creating game:', error);
      throw error;
    }
  }

  handleDisconnect(gameCode, playerId, socketId) {
    const game = this.getGame(gameCode);
    if (!game) return;

    const player = game.players.find(p => p.id === playerId);
    if (!player) return;

    // Store the disconnected player with timestamp and socket ID
    this.disconnectedPlayers.set(playerId, {
      player,
      gameCode,
      socketId,
      timestamp: Date.now()
    });

    // Set up timeout to remove player if they don't reconnect
    setTimeout(() => {
      const disconnectedInfo = this.disconnectedPlayers.get(playerId);
      if (disconnectedInfo) {
        console.log('GameManager: Player reconnection timeout:', playerId);
        this.removePlayer(gameCode, playerId);
        this.disconnectedPlayers.delete(playerId);
      }
    }, this.RECONNECT_TIMEOUT);
  }

  handleReconnect(gameCode, playerId, newSocketId) {
    const disconnectedInfo = this.disconnectedPlayers.get(playerId);
    if (disconnectedInfo && disconnectedInfo.gameCode === gameCode) {
      console.log('GameManager: Player reconnected:', playerId);
      this.disconnectedPlayers.delete(playerId);
      return true;
    }
    return false;
  }

  // ... rest of the existing methods ...
}

export default new GameManager();