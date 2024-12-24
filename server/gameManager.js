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
        rooms: rooms || [],
        players: [],
        phase: 'lobby',
        createdAt: new Date()
      };
      
      this.activeGames.set(code, game);
      console.log('GameManager: Game created successfully:', game);
      console.log('GameManager: Active games:', Array.from(this.activeGames.keys()));
      return game;
      
    } catch (error) {
      console.error('GameManager: Error creating game:', error);
      throw error;
    }
  }

  getGame(code) {
    console.log('GameManager: Getting game:', code);
    console.log('GameManager: Active games:', Array.from(this.activeGames.keys()));
    return this.activeGames.get(code);
  }

  endGame(code) {
    console.log('GameManager: Ending game:', code);
    if (this.activeGames.has(code)) {
      const game = this.activeGames.get(code);
      game.players = [];
      game.phase = 'ended';
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
      console.log('GameManager: Current players:', game.players.length);
      return game.players;
      
    } catch (error) {
      console.error('GameManager: Error adding player:', error);
      throw error;
    }
  }

  removePlayer(gameCode, playerId) {
    console.log('GameManager: Removing player', playerId, 'from game', gameCode);
    try {
      const game = this.getGame(gameCode);
      if (game) {
        const initialCount = game.players.length;
        game.players = game.players.filter(p => p.id !== playerId);
        console.log(`GameManager: Players in game: ${game.players.length} (was ${initialCount})`);
        this.activeGames.set(gameCode, game);
        return game.players;
      }
      return [];
    } catch (error) {
      console.error('GameManager: Error removing player:', error);
      return [];
    }
  }
}

export default new GameManager();