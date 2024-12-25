import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('create-game', ({ code, maxPlayers, rooms, clientId }) => {
      try {
        const game = gameManager.createGame(code, maxPlayers, rooms);
        socket.join(code);
        
        // Save admin session
        sessionManager.saveSession(clientId, { gameCode: code, isAdmin: true });
        
        socket.emit('game-created', { code, maxPlayers, rooms });
        socket.emit('game-state', {
          gameCode: code,
          players: [],
          phase: 'lobby'
        });
      } catch (error) {
        socket.emit('game-error', { message: error.message });
      }
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

        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        socket.join(gameCode);

        // Save player session
        sessionManager.saveSession(clientId, { 
          gameCode, 
          playerId: player.id,
          socketId: socket.id
        });

        socket.emit('join-game-success', { 
          player,
          gameCode,
          players: updatedPlayers
        });

        io.to(gameCode).emit('players-updated', updatedPlayers);
      } catch (error) {
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('register-session', ({ gameCode, playerId, clientId, isAdmin }) => {
      const game = gameManager.getGame(gameCode);
      if (!game) {
        socket.emit('game-error', { message: 'Game not found' });
        return;
      }

      socket.join(gameCode);
      
      if (isAdmin) {
        sessionManager.saveSession(clientId, { gameCode, isAdmin: true });
      } else {
        sessionManager.saveSession(clientId, { gameCode, playerId, socketId: socket.id });
      }

      socket.emit('game-state', {
        gameCode: game.code,
        players: game.players,
        phase: game.phase
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}