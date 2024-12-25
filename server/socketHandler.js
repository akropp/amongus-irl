import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('register-session', ({ gameCode, playerId, clientId, isAdmin }) => {
      console.log('Session registration:', { gameCode, playerId, clientId, isAdmin });
      
      const game = gameManager.getGame(gameCode);
      if (!game) {
        socket.emit('game-error', { message: 'Game not found' });
        return;
      }

      socket.join(gameCode);
      
      if (isAdmin) {
        sessionManager.saveSession(clientId, { 
          gameCode, 
          socketId: socket.id,
          isAdmin: true 
        });
      } else {
        const player = game.players.find(p => p.id === playerId);
        if (!player) {
          socket.emit('game-error', { message: 'Player not found' });
          return;
        }
        
        sessionManager.saveSession(clientId, { 
          gameCode,
          playerId,
          socketId: socket.id 
        });
      }
      
      // Send current game state
      socket.emit('game-state', {
        gameCode,
        players: game.players,
        phase: game.phase
      });
    });

    // Rest of the socket handlers...
  });
}