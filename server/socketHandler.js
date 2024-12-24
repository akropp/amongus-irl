import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    const clientId = socket.handshake.auth.clientId;
    console.log(`Client connected - Socket: ${socket.id}, Client ID: ${clientId}`);
    
    // Restore session if exists
    const existingSession = sessionManager.getSession(clientId);
    if (existingSession) {
      console.log(`Restoring session for client ${clientId}:`, existingSession);
      socket.emit('session-restored', existingSession);
    }

    socket.on('remove-player', ({ gameCode, playerId, clientId: requestingClientId }) => {
      console.log(`Remove player request - Client: ${requestingClientId}, Game: ${gameCode}, Player: ${playerId}`);
      try {
        const game = gameManager.getGame(gameCode);
        if (!game) {
          console.log('Game not found:', gameCode);
          return;
        }

        const updatedPlayers = gameManager.removePlayer(gameCode, playerId);
        
        // Remove session for the removed player's client
        const playerSession = Array.from(sessionManager.sessions.entries())
          .find(([_, session]) => 
            session.type === 'player' && 
            session.player?.id === playerId && 
            session.gameCode === gameCode
          );
        
        if (playerSession) {
          sessionManager.removeSession(playerSession[0]);
        }

        // Notify all clients in the game
        io.to(gameCode).emit('players-updated', updatedPlayers);
        io.to(gameCode).emit('player-removed', { playerId });
        
        // End game if no players left
        if (updatedPlayers.length === 0) {
          gameManager.endGame(gameCode);
          io.to(gameCode).emit('game-ended');
        }
      } catch (error) {
        console.error('Error removing player:', error);
      }
    });

    // ... rest of the socket handlers ...
  });
}