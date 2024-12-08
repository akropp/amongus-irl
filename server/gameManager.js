import { EventEmitter } from 'events';

class GameManager extends EventEmitter {
  constructor() {
    super();
    this.games = new Map();
    this.players = new Map();
  }

  createGame(code, maxPlayers, rooms) {
    const game = {
      code,
      maxPlayers,
      rooms,
      phase: 'lobby',
      createdAt: new Date()
    };
    
    this.games.set(code, game);
    this.players.set(code, []);
    
    return game;
  }

  addPlayer(gameCode, player) {
    const game = this.games.get(gameCode);
    if (!game) {
      throw new Error('Game not found');
    }

    const gamePlayers = this.players.get(gameCode) || [];
    if (gamePlayers.length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    this.players.set(gameCode, [...gamePlayers, player]);
    return this.players.get(gameCode);
  }

  removePlayer(gameCode, playerId) {
    const gamePlayers = this.players.get(gameCode);
    if (gamePlayers) {
      const updatedPlayers = gamePlayers.filter(p => p.id !== playerId);
      this.players.set(gameCode, updatedPlayers);
      return updatedPlayers;
    }
    return [];
  }

  getGame(code) {
    return this.games.get(code);
  }

  getPlayers(gameCode) {
    return this.players.get(gameCode) || [];
  }
}

export default new GameManager();