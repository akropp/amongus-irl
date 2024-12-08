import gameManager from './gameManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.emit('connection_established', { id: socket.id });

    socket.on('join-game', ({ gameCode, player }) => {
      try {
        const game = gameManager.getGame(gameCode);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        socket.join(gameCode);
        io.to(gameCode).emit('players-updated', updatedPlayers);
        
      } catch (error) {
        console.error('Error in join-game:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('create-game', ({ code, maxPlayers, rooms }) => {
      try {
        const game = gameManager.createGame(code, maxPlayers, rooms);
        socket.join(code);
        socket.emit('game-created', { code });
        
      } catch (error) {
        console.error('Error in create-game:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
    });
  });
}