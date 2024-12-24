import gameManager from './gameManager.js';

export default function setupSocketHandlers(io) {
  // Store socket ID to player ID mapping
  const socketToPlayer = new Map();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    let currentGame = null;
    let currentPlayer = null;

    socket.on('register-player', ({ gameCode, playerId }) => {
      console.log('Registering player:', playerId, 'for game:', gameCode);
      socketToPlayer.set(socket.id, { gameCode, playerId });
      
      // Check if this is a reconnection
      if (gameManager.handleReconnect(gameCode, playerId, socket.id)) {
        socket.join(gameCode);
        const game = gameManager.getGame(gameCode);
        if (game) {
          socket.emit('reconnection-successful');
          io.to(gameCode).emit('players-updated', game.players);
        }
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
      const playerInfo = socketToPlayer.get(socket.id);
      
      if (playerInfo) {
        const { gameCode, playerId } = playerInfo;
        gameManager.handleDisconnect(gameCode, playerId, socket.id);
        socketToPlayer.delete(socket.id);
      }
    });

    // ... rest of the existing socket handlers ...
  });
}