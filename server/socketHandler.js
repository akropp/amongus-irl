import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle session registration/restoration
    socket.on('register-session', ({ gameCode, playerId, clientId, isAdmin }) => {
      console.log('Session registration:', { gameCode, playerId, clientId, isAdmin });
      
      const game = gameManager.getGame(gameCode);
      if (!game) {
        socket.emit('game-error', { message: 'Game not found' });
        return;
      }

      // Join the game room
      socket.join(gameCode);
      
      // Save session
      sessionManager.saveSession(clientId, { gameCode, playerId, isAdmin });
      
      // Send current game state
      socket.emit('game-state', {
        gameCode: game.code,
        players: game.players,
        phase: game.phase
      });
    });

    socket.on('create-game', ({ code, maxPlayers, rooms, clientId }) => {
      console.log('Creating game:', { code, maxPlayers, rooms, clientId });
      try {
        if (gameManager.getGame(code)) {
          socket.emit('game-error', { message: 'Game already exists' });
          return;
        }
        
        const game = gameManager.createGame(code, maxPlayers, rooms);
        socket.join(code);
        
        // Save admin session
        sessionManager.saveSession(clientId, { gameCode: code, isAdmin: true });
        
        // Emit success events
        socket.emit('game-created', { code, maxPlayers, rooms });
        socket.emit('game-state', {
          gameCode: code,
          players: [],
          phase: 'lobby'
        });
        
      } catch (error) {
        console.error('Error creating game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('join-game', ({ gameCode, player }) => {
      console.log('Join attempt:', { gameCode, player });
      
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

        // Add player and join room
        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        socket.join(gameCode);

        // Emit success events
        socket.emit('join-game-success', { 
          player,
          gameCode,
          players: updatedPlayers
        });

        // Broadcast to all clients in the game
        io.to(gameCode).emit('players-updated', updatedPlayers);
        
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('remove-player', ({ gameCode, playerId, clientId, isAdmin }) => {
      console.log('Remove player:', { gameCode, playerId, clientId, isAdmin });
      
      const session = sessionManager.getSession(clientId);
      if (!session && !isAdmin) {
        socket.emit('game-error', { message: 'Invalid session' });
        return;
      }

      const updatedPlayers = gameManager.removePlayer(gameCode, playerId);
      
      // Notify all clients
      io.to(gameCode).emit('players-updated', updatedPlayers);
      io.to(gameCode).emit('player-removed', { playerId });
      
      // Clean up session if player removed themselves
      if (!isAdmin && session?.playerId === playerId) {
        sessionManager.removeSession(clientId);
      }
    });

    socket.on('end-game', ({ code }) => {
      console.log('Ending game:', code);
      if (gameManager.endGame(code)) {
        io.to(code).emit('game-ended');
        
        // Clean up all sessions for this game
        const sessions = sessionManager.getGameSessions(code);
        sessions.forEach(session => {
          sessionManager.removeSession(session.clientId);
        });
      }
    });

    socket.on('verify-game', ({ code }, callback) => {
      const exists = gameManager.verifyGame(code);
      callback({ exists });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}