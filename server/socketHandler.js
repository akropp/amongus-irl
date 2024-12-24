import gameManager from './gameManager.js';
import playerManager from './playerManager.js';
import socketManager from './socketManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('register-player', ({ gameCode, playerId }) => {
      console.log(`Registering player ${playerId} for game ${gameCode}`);
      
      const game = gameManager.getGame(gameCode);
      if (!game) return;

      socketManager.registerSocket(socket.id, gameCode, playerId);
      socket.join(gameCode);
      
      // Broadcast current game state
      io.to(gameCode).emit('players-updated', game.players);
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

        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        socketManager.registerSocket(socket.id, gameCode, player.id);
        socket.join(gameCode);

        // Emit success to joining player
        socket.emit('join-game-success', { 
          player,
          gameCode,
          players: updatedPlayers
        });

        // Broadcast to all players including sender
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
      
      // Notify the removed player
      socket.emit('player-removed', { playerId });
      
      // Broadcast updated player list to remaining players
      io.to(gameCode).emit('players-updated', updatedPlayers);
    });

    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
      
      const playerInfo = socketManager.unregisterSocket(socket.id);
      if (playerInfo) {
        const { gameCode, playerId } = playerInfo;
        playerManager.handleDisconnect(gameCode, playerId, socket.id);
        
        // Don't remove player immediately, wait for reconnect timeout
        const game = gameManager.getGame(gameCode);
        if (game) {
          io.to(gameCode).emit('player-disconnected', { playerId });
        }
      }
    });
  });

  // Handle player timeout
  playerManager.on('player-timeout', ({ gameCode, playerId }) => {
    const updatedPlayers = gameManager.removePlayer(gameCode, playerId);
    if (updatedPlayers.length > 0) {
      io.to(gameCode).emit('players-updated', updatedPlayers);
      io.to(gameCode).emit('player-removed', { playerId });
    }
  });
}