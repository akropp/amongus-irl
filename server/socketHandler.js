import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    const clientId = socket.handshake.auth.clientId;
    console.log(`Client connected - Socket: ${socket.id}, Client ID: ${clientId}`);
    
    socket.on('restore-session', ({ clientId, gameCode, playerId, isAdmin }) => {
      console.log('Restoring session:', { clientId, gameCode, playerId, isAdmin });
      
      const game = gameManager.getGame(gameCode);
      if (!game) return;

      socket.join(gameCode);
      
      if (isAdmin) {
        socket.emit('game-created', { 
          code: gameCode, 
          maxPlayers: game.maxPlayers, 
          rooms: game.rooms 
        });
      } else if (playerId) {
        const player = game.players.find(p => p.id === playerId);
        if (player) {
          socket.emit('join-game-success', {
            player,
            gameCode,
            players: game.players
          });
        }
      }
      
      // Broadcast updated players to all clients in the game
      io.to(gameCode).emit('players-updated', game.players);
    });

    // Rest of your existing socket handlers...
  });
}