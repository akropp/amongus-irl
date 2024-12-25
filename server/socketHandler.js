import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle session restoration on connect
    const { clientId, session } = socket.handshake.auth;
    if (clientId && session) {
      console.log('Restoring session for client:', clientId);
      sessionManager.saveSession(clientId, session);
      
      // If valid game session exists, join room and send state
      if (session.gameCode) {
        const game = gameManager.getGame(session.gameCode);
        if (game) {
          socket.join(session.gameCode);
          socket.emit('game-state', {
            gameCode: game.code,
            players: game.players,
            phase: game.phase
          });
        }
      }
    }

    socket.on('register-session', ({ clientId, gameCode, playerId, isAdmin }) => {
      console.log('Registering session:', { clientId, gameCode, playerId, isAdmin });
      
      sessionManager.saveSession(clientId, { gameCode, playerId, isAdmin });
      
      if (gameCode) {
        const game = gameManager.getGame(gameCode);
        if (game) {
          socket.join(gameCode);
          socket.emit('game-state', {
            gameCode: game.code,
            players: game.players,
            phase: game.phase
          });
        }
      }
    });

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
        
        socket.join(gameCode);
        socket.emit('join-game-success', { gameCode, player, players });
        io.to(gameCode).emit('players-updated', players);
        
      } catch (error) {
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('remove-player', ({ gameCode, playerId, clientId, isAdmin }) => {
      const game = gameManager.getGame(gameCode);
      if (!game) return;

      const players = gameManager.removePlayer(gameCode, playerId);
      
      if (!isAdmin) {
        sessionManager.removeSession(clientId);
      }
      
      socket.to(gameCode).emit('player-removed', { playerId });
      io.to(gameCode).emit('players-updated', players);
    });

    socket.on('end-game', ({ code }) => {
      if (gameManager.endGame(code)) {
        io.to(code).emit('game-ended');
        const sessions = sessionManager.getGameSessions(code);
        sessions.forEach(s => sessionManager.removeSession(s.clientId));
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}