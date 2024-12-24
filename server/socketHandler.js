import gameManager from './gameManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    let currentGame = null;
    let currentPlayer = null;

    socket.on('verify-game', ({ code }, callback) => {
      const game = gameManager.getGame(code);
      callback({ exists: !!game });
    });

    socket.on('end-game', ({ code }) => {
      console.log('Ending game:', code);
      if (gameManager.endGame(code)) {
        io.to(code).emit('game-ended');
        // Notify all clients in the game room
        socket.to(code).emit('game-ended');
      }
    });

    socket.on('create-game', ({ code, maxPlayers, rooms }) => {
      console.log(`Creating game - Code: ${code}, Max Players: ${maxPlayers}, Rooms:`, rooms);
      try {
        // Check if game exists first
        let game = gameManager.getGame(code);
        if (game) {
          socket.emit('join-game-error', { message: 'Game already exists' });
          return;
        }
        
        game = gameManager.createGame(code, maxPlayers, rooms);
        currentGame = code;
        socket.join(code);
        io.emit('game-created', { code, maxPlayers, rooms });
        
      } catch (error) {
        console.error('Error in create-game:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('join-game', ({ gameCode, player }) => {
      console.log(`Join game attempt - Code: ${gameCode}, Player:`, player);
      
      try {
        const game = gameManager.getGame(gameCode);
        
        if (!game) {
          socket.emit('join-game-error', { message: 'Game not found' });
          return;
        }

        if (game.players.length >= game.maxPlayers) {
          socket.emit('join-game-error', { message: 'Game is full' });
          return;
        }

        // Add player to the game
        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        currentGame = gameCode;
        currentPlayer = player;
        
        socket.join(gameCode);

        socket.emit('join-game-success', { 
          player,
          gameCode,
          players: updatedPlayers
        });

        io.to(gameCode).emit('players-updated', updatedPlayers);
        
      } catch (error) {
        console.error('Error in join-game:', error);
        socket.emit('join-game-error', { message: error.message });
      }
    });

    socket.on('remove-player', ({ gameCode, playerId }) => {
      console.log(`Removing player ${playerId} from game ${gameCode}`);
      const updatedPlayers = gameManager.removePlayer(gameCode, playerId);
      io.to(gameCode).emit('players-updated', updatedPlayers);
      
      // Notify the removed player
      socket.to(gameCode).emit('player-removed', { playerId });
    });

    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
      if (currentGame && currentPlayer) {
        const updatedPlayers = gameManager.removePlayer(currentGame, currentPlayer.id);
        io.to(currentGame).emit('players-updated', updatedPlayers);
      }
    });
  });
}