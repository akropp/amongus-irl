import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('register-session', ({ gameCode, playerId, clientId, isAdmin }) => {
      console.log('Registering session:', { gameCode, playerId, clientId, isAdmin });
      
      const game = gameManager.getGame(gameCode);
      if (!game) {
        socket.emit('game-error', { message: 'Game not found' });
        return;
      }

      // Join the game room
      socket.join(gameCode);
      
      // Save session
      sessionManager.saveSession(clientId, { 
        gameCode, 
        playerId, 
        socketId: socket.id,
        isAdmin 
      });

      // Send current game state
      socket.emit('game-state', {
        gameCode: game.code,
        players: game.players,
        phase: game.phase
      });
    });

    socket.on('join-game', ({ gameCode, player, clientId }) => {
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

        // Add player to game
        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        socket.join(gameCode);

        // Save session
        sessionManager.saveSession(clientId, { 
          gameCode, 
          playerId: player.id,
          socketId: socket.id
        });

        // Notify client of success
        socket.emit('join-game-success', { 
          player,
          gameCode,
          players: updatedPlayers
        });

        // Notify all clients in game of updated players
        io.to(gameCode).emit('players-updated', updatedPlayers);
        
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Don't remove player immediately, let reconnection window handle it
    });
  });
}