import { EventEmitter } from 'events';
import { gameQueries } from './db.js';

class GameManager extends EventEmitter {
  constructor() {
    super();
    this.activeGames = new Map(); // Track active games in memory
  }

  createGame(code, maxPlayers, rooms) {
    console.log('GameManager: Creating game with code:', code);
    
    try {
      const game = gameQueries.createGame(code, maxPlayers);
      if (game) {
        // Add rooms to the game
        rooms.forEach(room => {
          gameQueries.addRoom(code, room);
        });
        
        this.activeGames.set(code, game);
        console.log('GameManager: Game created successfully:', game);
        return game;
      }
      throw new Error('Failed to create game');
    } catch (error) {
      console.error('GameManager: Error creating game:', error);
      throw error;
    }
  }

  getGame(code) {
    let game = this.activeGames.get(code);
    if (!game) {
      game = gameQueries.getGameWithDetails(code);
      if (game) {
        this.activeGames.set(code, game);
      }
    }
    return game;
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

      const newPlayer = gameQueries.addPlayer(gameCode, player.id, player.name, player.role);
      if (!newPlayer) throw new Error('Failed to add player');

      game.players.push(newPlayer);
      this.activeGames.set(gameCode, game);
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
        const updatedPlayers = gameQueries.removePlayer(playerId);
        game.players = updatedPlayers;
        this.activeGames.set(gameCode, game);
        return updatedPlayers;
      }
      return [];
    } catch (error) {
      console.error('GameManager: Error removing player:', error);
      return [];
    }
  }

  updateGamePhase(gameCode, phase) {
    const game = this.getGame(gameCode);
    if (game) {
      gameQueries.updateGamePhase(phase, gameCode);
      game.phase = phase;
      this.activeGames.set(gameCode, game);
    }
  }
}

export default new GameManager();