import gameManager from '../gameManager.js';
import sessionManager from '../sessionManager.js';
import socketManager from '../socketManager.js';

export function handleGameEvents(io, socket) {
  socket.on('verify-game', ({ code }, callback) => {
    const exists = gameManager.verifyGame(code);
    console.log('🔍 Verifying game:', { code, exists });
    callback({ exists });
  });

  socket.on('create-game', ({ code, maxPlayers, rooms, clientId }) => {
    console.log('🎮 Creating game:', { code, maxPlayers, rooms, clientId });
    
    try {
      const game = gameManager.createGame(code, maxPlayers, rooms);
      
      if (sessionManager.saveSession(clientId, { 
        gameCode: code,
        socketId: socket.id,
        isAdmin: true
      })) {
        socket.join(code);
        socket.emit('game-created', { code, maxPlayers, rooms, players: [] });
        console.log('✅ Game created:', code);
      }
      
    } catch (error) {
      console.error('❌ Error creating game:', error);
      socket.emit('game-error', { message: error.message });
    }
  });

  socket.on('end-game', ({ code }) => {
    if (gameManager.endGame(code)) {
      io.to(code).emit('game-ended');
      const sessions = sessionManager.getGameSessions(code);
      sessions.forEach(s => sessionManager.removeSession(s.clientId));
    }
  });
}