import { EventEmitter } from 'events';

class GameManager extends EventEmitter {
  constructor() {
    super();
    this.activeGames = new Map();
  }

  createGame(code, maxPlayers, rooms) {
    console.log('GameManager: Creating game with code:', code);
    
    try {
      const game = {
        code,
        maxPlayers,
        rooms: [],
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

  endGame(code) {
    console.log('GameManager: Ending game:', code);
    if (this.activeGames.has(code)) {
      this.activeGames.delete(code);
      return true;
    }
    return false;
  }

  addPlayer(gameCode, player) {
    console.log('GameManager: Adding player to game:', gameCode);
    
    try {
      const game = this.getGame(gameCode);
      if (!game) {
        throw new Error('Game not found');
      }

      if (game.players.some(p => p.name === player.name)) {
        throw new Error('Player name already taken');
      }

      if (game.players.length >= game.maxPlayers) {
        throw new Error('Game is full');
      }

      game.players.push(player);
      this.activeGames.set(gameCode, game);
      
      console.log('GameManager: Player added successfully:', player);
      return game.players;
      
    } catch (error) {
      console.error('GameManager: Error adding player:', error);
      throw error;
    }
  }

  removePlayer(gameCode, playerId) {
    console.log('GameManager: Removing player', playerId);
    try {
      const game = this.getGame(gameCode);
      if (game) {
        game.players = game.players.filter(p => p.id !== playerId);
        this.activeGames.set(gameCode, game);
        return game.players;
      }
      return [];
    } catch (error) {
      console.error('GameManager: Error removing player:', error);
      return [];
    }
  }

  getGame(code) {
    return this.activeGames.get(code) || null;
  }

  updateGamePhase(gameCode, phase) {
    const game = this.getGame(gameCode);
    if (game) {
      game.phase = phase;
      this.activeGames.set(gameCode, game);
    }
  }
}

export default new GameManager();