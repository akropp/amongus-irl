import gameManager from '../gameManager.js';
import sessionManager from '../sessionManager.js';
import socketManager from '../socketManager.js';
import playerManager from '../playerManager.js';

export function handlePlayerEvents(io, socket) {
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
}

export function setupPlayerTimeouts(io) {
  playerManager.on('player-timeout', ({ gameCode, playerId }) => {
    const players = gameManager.removePlayer(gameCode, playerId);
    if (players.length > 0) {
      io.to(gameCode).emit('player-removed', { playerId });
      io.to(gameCode).emit('players-updated', players);
    }
  });
}