import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id, 'Auth:', socket.handshake.auth);

    // Store client ID from auth
    const clientId = socket.handshake.auth.clientId;
    if (clientId) {
      console.log('Client ID provided:', clientId);
      const session = sessionManager.getSession(clientId);
      if (session) {
        console.log('Restoring session for client:', session);
        socket.join(session.gameCode);
        
        // Send current game state
        const game = gameManager.getGame(session.gameCode);
        if (game) {
          socket.emit('game-state', {
            gameCode: game.code,
            players: game.players,
            phase: game.phase
          });
        }
      }
    }

    socket.onAny((event, ...args) => {
      console.log(`📥 [${socket.id}] Received ${event}:`, args);
    });

    // Rest of the socket handlers remain the same...
  });
}