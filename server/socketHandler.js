import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.onAny((event, ...args) => {
      console.log(`📥 [${socket.id}] Received ${event}:`, args);
    });

    socket.on('register-session', ({ gameCode, playerId, clientId, isAdmin }) => {
      console.log('🔄 Session registration:', { gameCode, playerId, clientId, isAdmin });
      
      try {
        const game = gameManager.getGame(gameCode);
        if (!game) {
          throw new Error('Game not found');
        }

        socket.join(gameCode);
        
        sessionManager.saveSession(clientId, {
          gameCode,
          playerId,
          socketId: socket.id,
          isAdmin
        });

        socket.emit('game-state', {
          gameCode,
          players: game.players,
          phase: game.phase
        });
        
        console.log('✅ Session registered');
        
      } catch (error) {
        console.error('❌ Registration error:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    // Rest of the socket handlers remain the same...
  });
}