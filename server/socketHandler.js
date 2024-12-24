import gameManager from './gameManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    const clientId = socket.handshake.auth.clientId || 'unknown';
    console.log(`Client connected - Socket: ${socket.id}, Client ID: ${clientId}`);
    
    socket.on('create-game', ({ code, maxPlayers, rooms }) => {
      console.log(`Creating game - Client: ${clientId}, Code: ${code}`);
      try {
        if (gameManager.getGame(code)) {
          socket.emit('error', { message: 'Game already exists' });
          return;
        }
        
        const game = gameManager.createGame(code, maxPlayers, rooms);
        socket.join(code);
        io.emit('game-created', { code, maxPlayers, rooms });
      } catch (error) {
        console.error('Error creating game:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('verify-game', ({ code }, callback) => {
      const exists = gameManager.verifyGame(code);
      callback({ exists });
    });

    socket.on('join-game', ({ gameCode, player }) => {
      console.log(`Join game attempt - Client: ${clientId}, Code: ${gameCode}`);
      try {
        const game = gameManager.getGame(gameCode);
        if (!game) {
          socket.emit('join-game-error', { message: 'Game not found' });
          return;
        }

        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        socket.join(gameCode);
        
        socket.emit('join-game-success', { 
          player,
          gameCode,
          players: updatedPlayers
        });

        io.to(gameCode).emit('players-updated', updatedPlayers);
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('join-game-error', { message: error.message });
      }
    });

    socket.on('remove-player', ({ gameCode, playerId }) => {
      console.log(`Remove player request - Client: ${clientId}, Game: ${gameCode}, Player: ${playerId}`);
      try {
        const updatedPlayers = gameManager.removePlayer(gameCode, playerId);
        
        // Notify all clients in the game about player removal
        io.to(gameCode).emit('players-updated', updatedPlayers);
        io.to(gameCode).emit('player-removed', { playerId });
        
        // If no players left, end the game
        if (updatedPlayers.length === 0) {
          io.to(gameCode).emit('game-ended');
        }
      } catch (error) {
        console.error('Error removing player:', error);
      }
    });

    socket.on('end-game', ({ code }) => {
      console.log(`End game request - Client: ${clientId}, Game: ${code}`);
      if (gameManager.endGame(code)) {
        io.to(code).emit('game-ended');
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected - Socket: ${socket.id}, Client ID: ${clientId}`);
    });
  });
}