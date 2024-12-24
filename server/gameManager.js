import { gameService } from '../src/services/gameService.js';

class GameManager {
  constructor() {
    this.activeGames = new Map();
  }

  async createGame(code, maxPlayers, rooms) {
    try {
      const game = await gameService.createGame(code, maxPlayers);
      if (game) {
        this.activeGames.set(code, game);
        return game;
      }
      throw new Error('Failed to create game');
    } catch (error) {
      console.error('GameManager: Error creating game:', error);
      throw error;
    }
  }

  async getGame(code) {
    let game = this.activeGames.get(code);
    if (!game) {
      game = await gameService.getGame(code);
      if (game) {
        this.activeGames.set(code, game);
      }
    }
    return game;
  }

  async addPlayer(gameCode, player) {
    try {
      const game = await this.getGame(gameCode);
      if (!game) throw new Error('Game not found');

      if (game.players.some(p => p.name === player.name)) {
        throw new Error('Player name already taken');
      }

      if (game.players.length >= game.maxPlayers) {
        throw new Error('Game is full');
      }

      const newPlayer = await gameService.addPlayer(gameCode, player);
      if (!newPlayer) throw new Error('Failed to add player');

      game.players.push(newPlayer);
      this.activeGames.set(gameCode, game);
      return game.players;
    } catch (error) {
      console.error('GameManager: Error adding player:', error);
      throw error;
    }
  }

  async removePlayer(gameCode, playerId) {
    try {
      const game = await this.getGame(gameCode);
      if (game) {
        await gameService.removePlayer(gameCode, playerId);
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

  async updateGamePhase(gameCode, phase) {
    try {
      await gameService.updateGamePhase(gameCode, phase);
      const game = await this.getGame(gameCode);
      if (game) {
        game.phase = phase;
        this.activeGames.set(gameCode, game);
      }
    } catch (error) {
      console.error('GameManager: Error updating game phase:', error);
    }
  }
}

export default new GameManager();