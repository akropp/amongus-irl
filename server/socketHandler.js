import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('create-game', ({ code, maxPlayers, rooms, clientId }) => {
      console.log('Creating game:', { code, maxPlayers, rooms });
      try {
        // Check if game exists first
        if (gameManager.verifyGame(code)) {
          socket.emit('game-error', { message: 'Game already exists' });
          return;
        }
        
        const game = gameManager.createGame(code, maxPlayers, rooms);
        
        // Save admin session
        sessionManager.saveSession(clientId, {
          gameCode: code,
          socketId: socket.id,
          isAdmin: true
        });
        
        // Join socket room
        socket.join(code);
        
        // Emit success events
        socket.emit('game-state', {
          gameCode: code,
          players: game.players,
          phase: game.phase
        });
        
        io.emit('game-created', { code, maxPlayers, rooms });
        
      } catch (error) {
        console.error('Error creating game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('register-session', ({ gameCode, playerId, clientId, isAdmin }) => {
      console.log('Session registration:', { gameCode, playerId, clientId, isAdmin });
      
      const game = gameManager.getGame(gameCode);
      if (!game) return;

      socket.join(gameCode);
      
      if (isAdmin) {
        sessionManager.saveSession(clientId, { 
          gameCode, 
          socketId: socket.id,
          isAdmin: true 
        });
      } else {
        const player = game.players.find(p => p.id === playerId);
        if (!player) return;
        
        sessionManager.saveSession(clientId, { 
          gameCode,
          playerId,
          socketId: socket.id 
        });
      }
      
      socket.emit('game-state', {
        gameCode,
        players: game.players,
        phase: game.phase
      });
    });

    socket.on('join-game', ({ gameCode, player }) => {
      console.log('Join game attempt:', { gameCode, player });
      
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

    socket.on('remove-player', ({ gameCode, playerId, isAdmin }) => {
      console.log('Remove player:', { gameCode, playerId, isAdmin });
      
      const game = gameManager.getGame(gameCode);
      if (!game) return;

      const updatedPlayers = gameManager.removePlayer(gameCode, playerId);
      io.to(gameCode).emit('players-updated', updatedPlayers);
      io.to(gameCode).emit('player-removed', { playerId });
    });

    socket.on('end-game', ({ code }) => {
      console.log('Ending game:', code);
      if (gameManager.endGame(code)) {
        io.to(code).emit('game-ended');
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}