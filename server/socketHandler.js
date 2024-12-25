import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';
import socketManager from './socketManager.js';
import playerManager from './playerManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Get client ID from auth
    const { clientId } = socket.handshake.auth;
    if (!clientId) {
      console.log('No client ID provided, closing connection');
      socket.disconnect();
      return;
    }

    // Handle session registration
    socket.on('register-session', ({ clientId, gameCode, playerId, isAdmin }) => {
      console.log('Registering session:', { clientId, gameCode, playerId, isAdmin });
      
      sessionManager.saveSession(clientId, { gameCode, playerId, isAdmin });
      
      if (gameCode) {
        const game = gameManager.getGame(gameCode);
        if (game) {
          socket.join(gameCode);
          if (playerId) {
            socketManager.registerSocket(socket.id, gameCode, playerId);
          }
          socket.emit('game-state', {
            gameCode: game.code,
            players: game.players,
            phase: game.phase
          });
        }
      }
    });

    // Handle game creation
    socket.on('create-game', ({ code, maxPlayers, rooms, clientId }) => {
      try {
        if (gameManager.verifyGame(code)) {
          socket.emit('game-error', { message: 'Game already exists' });
          return;
        }
        
        const game = gameManager.createGame(code, maxPlayers, rooms);
        sessionManager.saveSession(clientId, { gameCode: code, isAdmin: true });
        
        socket.join(code);
        socket.emit('game-created', {
          code: game.code,
          maxPlayers: game.maxPlayers,
          rooms: game.rooms,
          players: game.players
        });
        
      } catch (error) {
        socket.emit('game-error', { message: error.message });
      }
    });

    // Handle player joining
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

        const players = gameManager.addPlayer(gameCode, player);
        sessionManager.saveSession(clientId, { 
          gameCode, 
          playerId: player.id,
          isAdmin: false 
        });
        
        socketManager.registerSocket(socket.id, gameCode, player.id);
        socket.join(gameCode);
        
        socket.emit('join-game-success', { gameCode, player, players });
        io.to(gameCode).emit('players-updated', players);
        
      } catch (error) {
        socket.emit('game-error', { message: error.message });
      }
    });

    // Handle player removal
    socket.on('remove-player', ({ gameCode, playerId, clientId, isAdmin }) => {
      const game = gameManager.getGame(gameCode);
      if (!game) {
        socket.emit('game-error', { message: 'Game not found' });
        return;
      }

      const players = gameManager.removePlayer(gameCode, playerId);
      
      if (!isAdmin) {
        sessionManager.removeSession(clientId);
        socketManager.unregisterSocket(socket.id);
      }
      
      socket.to(gameCode).emit('player-removed', { playerId });
      io.to(gameCode).emit('players-updated', players);
    });

    // Handle game verification
    socket.on('verify-game', ({ code }, callback) => {
      const exists = gameManager.verifyGame(code);
      callback({ exists });
    });

    // Handle game ending
    socket.on('end-game', ({ code }) => {
      if (gameManager.endGame(code)) {
        io.to(code).emit('game-ended');
        const sessions = sessionManager.getGameSessions(code);
        sessions.forEach(s => sessionManager.removeSession(s.clientId));
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      const playerInfo = socketManager.getPlayerInfo(socket.id);
      if (playerInfo) {
        const { gameCode, playerId } = playerInfo;
        playerManager.handleDisconnect(gameCode, playerId, socket.id);
        
        // Remove socket registration but keep session
        socketManager.unregisterSocket(socket.id);
      }
    });

    // Handle reconnection
    socket.on('rejoin-game', ({ gameCode, playerId, clientId }) => {
      const game = gameManager.getGame(gameCode);
      if (!game) {
        socket.emit('game-error', { message: 'Game not found' });
        return;
      }

      const wasReconnected = playerManager.handleReconnect(gameCode, playerId, socket.id);
      if (wasReconnected) {
        socketManager.registerSocket(socket.id, gameCode, playerId);
        socket.join(gameCode);
        socket.emit('game-state', {
          gameCode: game.code,
          players: game.players,
          phase: game.phase
        });
      }
    });
  });

  // Handle player timeouts
  playerManager.on('player-timeout', ({ gameCode, playerId }) => {
    const players = gameManager.removePlayer(gameCode, playerId);
    if (players.length > 0) {
      io.to(gameCode).emit('player-removed', { playerId });
      io.to(gameCode).emit('players-updated', players);
    }
  });
}