import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Get client ID from auth
    const { clientId } = socket.handshake.auth;
    if (!clientId) {
      console.log('No client ID provided, closing connection');
      socket.disconnect();
      return;
    }

    // Restore session if exists
    const session = sessionManager.getSession(clientId);
    if (session?.gameCode) {
      console.log('Restoring session:', session);
      
      const game = gameManager.getGame(session.gameCode);
      if (game) {
        socket.join(session.gameCode);
        socket.emit('game-state', {
          gameCode: game.code,
          players: game.players,
          phase: game.phase
        });
      }
    }

    socket.on('join-game', ({ gameCode, player, clientId }) => {
      try {
        const game = gameManager.getGame(gameCode);
        if (!game) {
          socket.emit('game-error', { message: 'Game not found' });
          return;
        }

        if (game.players.length >= game.maxPlayers) {
          socket.emit('game-error', { message: 'Game is full' });
          return;
        }

        const players = gameManager.addPlayer(gameCode, player);
        sessionManager.saveSession(clientId, { 
          gameCode, 
          playerId: player.id,
          isAdmin: false 
        });
        
        socket.join(gameCode);
        socket.emit('join-game-success', { gameCode, player, players });
        io.to(gameCode).emit('players-updated', players);
        
      } catch (error) {
        socket.emit('game-error', { message: error.message });
      }
    });

    // Rest of socket handlers remain the same...
  });
}