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
      if (gameManager.verifyGame(code)) {
        throw new Error('Game already exists');
      }

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
    console.log('🏁 Ending game:', code);
    if (gameManager.endGame(code)) {
      // Get all sessions for this game before ending it
      const sessions = sessionManager.getGameSessions(code);
      console.log('📤 Notifying players and cleaning up sessions');
      
      // Notify all players in the game room
      io.to(code).emit('game-ended');
      
      // Clean up sessions
      sessions.forEach(session => {
        sessionManager.removeSession(session.clientId);
        if (session.socketId) {
          socketManager.unregisterSocket(session.socketId);
        }
      });
    }
  });
}