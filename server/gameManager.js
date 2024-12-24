import { EventEmitter } from 'events';

class GameManager extends EventEmitter {
  constructor() {
    super();
    this.activeGames = new Map();
    this.disconnectedPlayers = new Map();
    this.RECONNECT_TIMEOUT = 30000;
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

  getGame(code) {
    return this.activeGames.get(code);
  }

  addPlayer(gameCode, player) {
    const game = this.getGame(gameCode);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.players.some(p => p.name === player.name)) {
      throw new Error('Player name already taken');
    }

    game.players.push(player);
    this.activeGames.set(gameCode, game);
    return game.players;
  }

  removePlayer(gameCode, playerId) {
    const game = this.getGame(gameCode);
    if (game) {
      game.players = game.players.filter(p => p.id !== playerId);
      
      if (game.players.length === 0) {
        this.activeGames.delete(gameCode);
        return [];
      }
      
      this.activeGames.set(gameCode, game);
      return game.players;
    }
    return [];
  }

  endGame(code) {
    return this.activeGames.delete(code);
  }

  handleDisconnect(gameCode, playerId, socketId) {
    const game = this.getGame(gameCode);
    if (!game) return;

    const player = game.players.find(p => p.id === playerId);
    if (!player) return;

    this.disconnectedPlayers.set(playerId, {
      player,
      gameCode,
      socketId,
      timestamp: Date.now()
    });

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
}

export default new GameManager();