import { EventEmitter } from 'events';

class GameManager extends EventEmitter {
  constructor() {
    super();
    this.games = new Map();
    this.players = new Map();
  }

  createGame(code, maxPlayers, rooms) {
    console.log('GameManager: Creating game with code:', code);
    
    const game = {
      code,
      maxPlayers,
      rooms,
      phase: 'lobby',
      createdAt: new Date()
    };
    
    this.games.set(code, game);
    this.players.set(code, []);
    
    console.log('GameManager: Game created. Total games:', this.games.size);
    return game;
  }

  addPlayer(gameCode, player) {
    console.log('GameManager: Adding player to game:', gameCode);
    const game = this.games.get(gameCode);
    if (!game) {
      console.log('GameManager: Game not found. Available games:', Array.from(this.games.keys()));
      throw new Error('Game not found');
    }

    const gamePlayers = this.players.get(gameCode) || [];
    if (gamePlayers.length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    this.players.set(gameCode, [...gamePlayers, player]);
    console.log(`GameManager: Player ${player.name} added to game ${gameCode}`);
    return this.players.get(gameCode);
  }

  removePlayer(gameCode, playerId) {
    console.log('GameManager: Removing player', playerId, 'from game', gameCode);
    const gamePlayers = this.players.get(gameCode);
    if (gamePlayers) {
      const updatedPlayers = gamePlayers.filter(p => p.id !== playerId);
      this.players.set(gameCode, updatedPlayers);
      return updatedPlayers;
    }
    return [];
  }

  getGame(code) {
    const game = this.games.get(code);
    console.log('GameManager: Getting game:', code, game ? 'Found' : 'Not found');
    return game;
  }

  getPlayers(gameCode) {
    const players = this.players.get(gameCode) || [];
    console.log('GameManager: Getting players for game:', gameCode, 'Count:', players.length);
    return players;
  }
}

export default new GameManager();