import gameManager from './gameManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('create-game', ({ code, maxPlayers, rooms }) => {
      console.log(`Creating game - Code: ${code}, Max Players: ${maxPlayers}, Rooms:`, rooms);
      try {
        // Check if game exists first
        let game = gameManager.getGame(code);
        if (game) {
          socket.emit('game-error', { message: 'Game already exists' });
          return;
        }
        
        game = gameManager.createGame(code, maxPlayers, rooms);
        socket.join(code);
        
        // Emit success events
        socket.emit('game-created', { code, maxPlayers, rooms });
        socket.emit('game-state', {
          gameCode: code,
          players: [],
          phase: 'lobby'
        });
        
      } catch (error) {
        console.error('Error in create-game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('join-game', ({ gameCode, player }) => {
      console.log(`Join game attempt - Code: ${gameCode}, Player:`, player);
      
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

        // Add player to the game
        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        socket.join(gameCode);

        // Emit success events
        socket.emit('join-game-success', { 
          player,
          gameCode,
          players: updatedPlayers
        });

        // Broadcast to all players in the game
        io.to(gameCode).emit('players-updated', updatedPlayers);
        
      } catch (error) {
        console.error('Error in join-game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('end-game', ({ code }) => {
      console.log('Ending game:', code);
      if (gameManager.endGame(code)) {
        io.to(code).emit('game-ended');
      }
    });

    socket.on('remove-player', ({ gameCode, playerId }) => {
      console.log(`Removing player ${playerId} from game ${gameCode}`);
      const updatedPlayers = gameManager.removePlayer(gameCode, playerId);
      
      // Notify all clients in the game
      io.to(gameCode).emit('players-updated', updatedPlayers);
      io.to(gameCode).emit('player-removed', { playerId });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}