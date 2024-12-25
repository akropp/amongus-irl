import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('create-game', ({ code, maxPlayers, rooms, clientId }) => {
      console.log('Creating game:', { code, maxPlayers, rooms });
      
      try {
        // Check if game exists
        if (gameManager.verifyGame(code)) {
          socket.emit('game-error', { message: 'Game already exists' });
          return;
        }
        
        // Create new game
        const game = gameManager.createGame(code, maxPlayers, rooms);
        
        // Save admin session
        sessionManager.saveSession(clientId, { 
          gameCode: code,
          socketId: socket.id,
          isAdmin: true
        });
        
        // Join socket to game room
        socket.join(code);
        
        // Notify client
        socket.emit('game-created', { 
          code,
          maxPlayers,
          rooms,
          players: []
        });
        
      } catch (error) {
        console.error('Error creating game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    // Rest of the socket handlers...
  });
}