class GameManager {
  constructor() {
    this.activeGames = new Map();
  }

  createGame(code, maxPlayers, rooms) {
    console.log('GameManager: Creating game with code:', code);
    
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
  }

  getGame(code) {
    return this.activeGames.get(code);
  }

  verifyGame(code) {
    return this.activeGames.has(code);
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
}

export default new GameManager();