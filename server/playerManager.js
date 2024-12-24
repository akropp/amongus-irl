import { EventEmitter } from 'events';

class PlayerManager extends EventEmitter {
  constructor() {
    super();
    this.disconnectedPlayers = new Map();
    this.RECONNECT_TIMEOUT = 30000; // 30 seconds
  }

  handleDisconnect(gameCode, playerId, socketId) {
    console.log(`PlayerManager: Player ${playerId} disconnected from game ${gameCode}`);
    
    this.disconnectedPlayers.set(playerId, {
      gameCode,
      socketId,
      timestamp: Date.now()
    });

    setTimeout(() => {
      if (this.disconnectedPlayers.has(playerId)) {
        console.log(`PlayerManager: Player ${playerId} failed to reconnect, removing`);
        this.emit('player-timeout', { gameCode, playerId });
        this.disconnectedPlayers.delete(playerId);
      }
    }, this.RECONNECT_TIMEOUT);
  }

  handleReconnect(gameCode, playerId, newSocketId) {
    const playerInfo = this.disconnectedPlayers.get(playerId);
    
    if (playerInfo && playerInfo.gameCode === gameCode) {
      console.log(`PlayerManager: Player ${playerId} reconnected to game ${gameCode}`);
      this.disconnectedPlayers.delete(playerId);
      return true;
    }
    
    return false;
  }

  isDisconnected(playerId) {
    return this.disconnectedPlayers.has(playerId);
  }

  getDisconnectedPlayers(gameCode) {
    return Array.from(this.disconnectedPlayers.entries())
      .filter(([_, info]) => info.gameCode === gameCode)
      .map(([playerId]) => playerId);
  }
}

export default new PlayerManager();