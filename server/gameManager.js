import { EventEmitter } from 'events';
import { gameQueries } from './db.js';

class GameManager extends EventEmitter {
  constructor() {
    super();
  }

  createGame(code, maxPlayers, rooms) {
    console.log('GameManager: Creating game with code:', code);
    
    try {
      gameQueries.createGame.run(code, maxPlayers);
      
      // Add rooms
      for (const room of rooms) {
        gameQueries.addRoom.run(code, room);
      }
      
      const game = this.getGame(code);
      console.log('GameManager: Game created successfully:', game);
      return game;
      
    } catch (error) {
      console.error('GameManager: Error creating game:', error);
      throw error;
    }
  }

  addPlayer(gameCode, player) {
    console.log('GameManager: Adding player to game:', gameCode);
    
    try {
      const game = this.getGame(gameCode);
      if (!game) {
        throw new Error('Game not found');
      }

      const players = this.getPlayers(gameCode);
      if (players.some(p => p.name === player.name)) {
        throw new Error('Player name already taken');
      }

      if (players.length >= game.maxPlayers) {
        throw new Error('Game is full');
      }

      gameQueries.addPlayer.run(player.id, gameCode, player.name, player.role);
      
      const updatedPlayers = this.getPlayers(gameCode);
      console.log('GameManager: Player added successfully:', player);
      return updatedPlayers;
      
    } catch (error) {
      console.error('GameManager: Error adding player:', error);
      throw error;
    }
  }

  removePlayer(gameCode, playerId) {
    console.log('GameManager: Removing player', playerId);
    try {
      gameQueries.removePlayer.run(playerId);
      return this.getPlayers(gameCode);
    } catch (error) {
      console.error('GameManager: Error removing player:', error);
      return [];
    }
  }

  getGame(code) {
    try {
      const result = gameQueries.getGameWithDetails.get(code);
      if (!result) return null;

      // Parse JSON arrays from SQLite
      result.rooms = JSON.parse(result.rooms);
      result.players = JSON.parse(result.players);
      
      // Filter out null values that might come from LEFT JOINs
      if (result.rooms[0] === null) result.rooms = [];
      if (result.players[0].id === null) result.players = [];
      
      return result;
    } catch (error) {
      console.error('GameManager: Error getting game:', error);
      return null;
    }
  }

  getPlayers(gameCode) {
    try {
      return gameQueries.getPlayers.all(gameCode);
    } catch (error) {
      console.error('GameManager: Error getting players:', error);
      return [];
    }
  }

  updateGamePhase(gameCode, phase) {
    try {
      gameQueries.updateGamePhase.run(phase, gameCode);
    } catch (error) {
      console.error('GameManager: Error updating game phase:', error);
    }
  }
}

export default new GameManager();