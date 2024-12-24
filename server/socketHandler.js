import gameManager from './gameManager.js';
import playerManager from './playerManager.js';
import socketManager from './socketManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Player Registration and Reconnection
    socket.on('register-player', ({ gameCode, playerId }) => {
      console.log(`Registering player ${playerId} for game ${gameCode}`);
      
      socketManager.registerSocket(socket.id, gameCode, playerId);
      
      if (playerManager.handleReconnect(gameCode, playerId, socket.id)) {
        socket.join(gameCode);
        const game = gameManager.getGame(gameCode);
        if (game) {
          socket.emit('reconnection-successful');
          io.to(gameCode).emit('players-updated', game.players);
        }
      }
    });

    // Game Creation and Management
    socket.on('create-game', ({ code, maxPlayers, rooms }) => {
      console.log(`Creating game - Code: ${code}, Max Players: ${maxPlayers}, Rooms:`, rooms);
      try {
        const existingGame = gameManager.getGame(code);
        if (existingGame) {
          socket.emit('join-game-error', { message: 'Game already exists' });
          return;
        }
        
        const game = gameManager.createGame(code, maxPlayers, rooms);
        socket.join(code);
        io.emit('game-created', { code, maxPlayers, rooms });
        
      } catch (error) {
        console.error('Error in create-game:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Player Join/Leave Management
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

        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        socketManager.registerSocket(socket.id, gameCode, player.id);
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
      socketManager.unregisterSocket(socket.id);
      socket.leave(gameCode);
      
      io.to(gameCode).emit('players-updated', updatedPlayers);
      socket.emit('player-removed', { playerId });
    });

    // Game State Management
    socket.on('verify-game', ({ code }, callback) => {
      const game = gameManager.getGame(code);
      callback({ exists: !!game });
    });

    socket.on('end-game', ({ code }) => {
      console.log('Ending game:', code);
      const game = gameManager.getGame(code);
      if (game) {
        gameManager.endGame(code);
        io.to(code).emit('game-ended');
        
        // Disconnect all players from the game room
        const sockets = io.sockets.adapter.rooms.get(code);
        if (sockets) {
          sockets.forEach(socketId => {
            const socket = io.sockets.sockets.get(socketId);
            if (socket) {
              socket.leave(code);
            }
          });
        }
      }
    });

    // Disconnection Handling
    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
      
      const playerInfo = socketManager.unregisterSocket(socket.id);
      if (playerInfo) {
        const { gameCode, playerId } = playerInfo;
        playerManager.handleDisconnect(gameCode, playerId, socket.id);
      }
    });
  });

  // Handle player timeout (when reconnection fails)
  playerManager.on('player-timeout', ({ gameCode, playerId }) => {
    const game = gameManager.getGame(gameCode);
    if (game) {
      const updatedPlayers = gameManager.removePlayer(gameCode, playerId);
      io.to(gameCode).emit('players-updated', updatedPlayers);
      io.to(gameCode).emit('player-removed', { playerId });
    }
  });
}