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
    console.log('GameManager: Adding player to game:', gameCode);
    
    try {
      const game = this.getGame(gameCode);
      if (!game) {
        throw new Error('Game not found');
      }

      if (game.players.length >= game.maxPlayers) {
        throw new Error('Game is full');
      }

      if (game.players.some(p => p.name === player.name)) {
        throw new Error('Player name already taken');
      }

      game.players.push(player);
      this.activeGames.set(gameCode, game);
      
      console.log('GameManager: Player added successfully:', player);
      console.log('GameManager: Current players:', game.players.length, '/', game.maxPlayers);
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
      if (!game) {
        console.log('GameManager: Game not found');
        return [];
      }

      const initialLength = game.players.length;
      game.players = game.players.filter(p => p.id !== playerId);
      
      if (game.players.length !== initialLength) {
        console.log(`GameManager: Player removed. Players remaining: ${game.players.length}`);
        
        if (game.players.length === 0) {
          console.log('GameManager: No players left, removing game');
          this.activeGames.delete(gameCode);
          return [];
        }
        
        this.activeGames.set(gameCode, game);
      }
      
      return game.players;
    } catch (error) {
      console.error('GameManager: Error removing player:', error);
      return [];
    }
  }

  endGame(code) {
    console.log('GameManager: Ending game:', code);
    return this.activeGames.delete(code);
  }
}

export default new GameManager();