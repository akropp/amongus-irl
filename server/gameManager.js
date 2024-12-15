import { EventEmitter } from 'events';

class GameManager extends EventEmitter {
  constructor() {
    super();
    this.games = new Map();
    this.players = new Map();
  }

  createGame(code, maxPlayers, rooms) {
    console.log('GameManager: Creating game with code:', code);
    
    if (this.games.has(code)) {
      console.log('GameManager: Game already exists with code:', code);
      return this.games.get(code);
    }
    
    const game = {
      code,
      maxPlayers,
      rooms,
      phase: 'lobby',
      createdAt: new Date(),
      players: []
    };
    
    this.games.set(code, game);
    this.players.set(code, []);
    
    console.log('GameManager: Game created successfully:', game);
    console.log('GameManager: Total games:', this.games.size);
    return game;
  }

  addPlayer(gameCode, player) {
    console.log('GameManager: Adding player to game:', gameCode);
    console.log('GameManager: Player details:', player);
    
    const game = this.games.get(gameCode);
    if (!game) {
      console.log('GameManager: Game not found. Available games:', Array.from(this.games.keys()));
      throw new Error('Game not found');
    }

    const gamePlayers = this.players.get(gameCode) || [];
    console.log('GameManager: Current players in game:', gamePlayers);

    // Check if player with same name already exists
    if (gamePlayers.some(p => p.name === player.name)) {
      throw new Error('Player name already taken');
    }

    if (gamePlayers.length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    const updatedPlayers = [...gamePlayers, player];
    this.players.set(gameCode, updatedPlayers);
    game.players = updatedPlayers;
    
    console.log(`GameManager: Player ${player.name} added to game ${gameCode}`);
    console.log('GameManager: Updated players list:', updatedPlayers);
    return updatedPlayers;
  }

  removePlayer(gameCode, playerId) {
    console.log('GameManager: Removing player', playerId, 'from game', gameCode);
    const game = this.games.get(gameCode);
    const gamePlayers = this.players.get(gameCode);
    
    if (game && gamePlayers) {
      const updatedPlayers = gamePlayers.filter(p => p.id !== playerId);
      this.players.set(gameCode, updatedPlayers);
      game.players = updatedPlayers;
      console.log('GameManager: Updated players after removal:', updatedPlayers);
      return updatedPlayers;
    }
    return [];
  }

  getGame(code) {
    const game = this.games.get(code);
    console.log('GameManager: Getting game:', code);
    console.log('GameManager: Game found:', game);
    console.log('GameManager: Available games:', Array.from(this.games.keys()));
    return game;
  }

  getPlayers(gameCode) {
    const players = this.players.get(gameCode) || [];
    console.log('GameManager: Getting players for game:', gameCode);
    console.log('GameManager: Players found:', players);
    return players;
  }

  updateGamePhase(gameCode, phase) {
    const game = this.games.get(gameCode);
    if (game) {
      game.phase = phase;
      console.log(`GameManager: Updated game ${gameCode} phase to ${phase}`);
    }
  }
}

export default new GameManager();