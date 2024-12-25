import socketManager from '../socketManager.js';
import playerManager from '../playerManager.js';

export function handleConnection(socket) {
  console.log('🔌 Client connected:', socket.id);

  socket.onAny((event, ...args) => {
    console.log(`📥 [${socket.id}] Received ${event}:`, args);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    const playerInfo = socketManager.getPlayerInfo(socket.id);
    if (playerInfo) {
      const { gameCode, playerId } = playerInfo;
      playerManager.handleDisconnect(gameCode, playerId, socket.id);
      socketManager.unregisterSocket(socket.id);
    }
  });
}