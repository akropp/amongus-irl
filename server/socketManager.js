class SocketManager {
  constructor() {
    this.socketToPlayer = new Map();
    this.playerToSocket = new Map();
  }

  registerSocket(socketId, gameCode, playerId) {
    this.socketToPlayer.set(socketId, { gameCode, playerId });
    this.playerToSocket.set(playerId, socketId);
  }

  unregisterSocket(socketId) {
    const playerInfo = this.socketToPlayer.get(socketId);
    if (playerInfo) {
      this.playerToSocket.delete(playerInfo.playerId);
      this.socketToPlayer.delete(socketId);
    }
    return playerInfo;
  }

  getPlayerInfo(socketId) {
    return this.socketToPlayer.get(socketId);
  }

  getSocketId(playerId) {
    return this.playerToSocket.get(playerId);
  }
}

export default new SocketManager();