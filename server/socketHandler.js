import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  // Make gameManager globally available for session validation
  global.gameManager = gameManager;

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.onAny((event, ...args) => {
      console.log(`📥 [${socket.id}] Received ${event}:`, args);
    });

    socket.on('verify-game', ({ code }, callback) => {
      const exists = gameManager.verifyGame(code);
      console.log('🔍 Verifying game:', { code, exists });
      callback({ exists });
    });

    socket.on('create-game', ({ code, maxPlayers, rooms, clientId }) => {
      console.log('🎮 Creating game:', { code, maxPlayers, rooms, clientId });
      
      try {
        const game = gameManager.createGame(code, maxPlayers, rooms);
        
        if (sessionManager.saveSession(clientId, { 
          gameCode: code,
          socketId: socket.id,
          isAdmin: true
        })) {
          socket.join(code);
          socket.emit('game-created', { code, maxPlayers, rooms, players: [] });
          console.log('✅ Game created:', code);
        }
        
      } catch (error) {
        console.error('❌ Error creating game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('join-game', ({ gameCode, player, clientId }) => {
      console.log('👤 Join attempt:', { gameCode, player: player.name, clientId });
      
      try {
        const game = gameManager.getGame(gameCode);
        if (!game) {
          throw new Error('Game not found');
        }

        const players = gameManager.addPlayer(gameCode, player);
        
        if (sessionManager.saveSession(clientId, {
          gameCode,
          playerId: player.id,
          socketId: socket.id
        })) {
          socket.join(gameCode);
          socket.emit('join-game-success', { gameCode, player, players });
          io.to(gameCode).emit('players-updated', players);
          console.log('✅ Player joined:', player.name);
        }
        
      } catch (error) {
        console.error('❌ Join error:', error);
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