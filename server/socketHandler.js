import gameManager from './gameManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.emit('connection_established', { id: socket.id });

    socket.on('join-game', ({ gameCode, player }) => {
      console.log(`Join game attempt - Code: ${gameCode}, Player: ${player.name}`);
      try {
        const game = gameManager.getGame(gameCode);
        console.log('Found game:', game);
        
        if (!game) {
          console.log('Game not found for code:', gameCode);
          console.log('Available games:', Array.from(gameManager.games.keys()));
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        console.log(`Player ${player.name} joined game ${gameCode}. Total players:`, updatedPlayers.length);
        
        socket.join(gameCode);
        io.to(gameCode).emit('players-updated', updatedPlayers);
        
      } catch (error) {
        console.error('Error in join-game:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('create-game', ({ code, maxPlayers, rooms }) => {
      console.log(`Creating game - Code: ${code}, Max Players: ${maxPlayers}, Rooms:`, rooms);
      try {
        const game = gameManager.createGame(code, maxPlayers, rooms);
        console.log('Game created successfully:', game);
        
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