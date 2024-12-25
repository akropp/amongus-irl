import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id, 'Auth:', socket.handshake.auth);

    // Store client ID from auth
    const clientId = socket.handshake.auth.clientId;
    if (clientId) {
      console.log('Client ID provided:', clientId);
      const session = sessionManager.getSession(clientId);
      if (session) {
        console.log('Restoring session for client:', session);
        socket.join(session.gameCode);
        
        // Send current game state
        const game = gameManager.getGame(session.gameCode);
        if (game) {
          socket.emit('game-state', {
            gameCode: game.code,
            players: game.players,
            phase: game.phase
          });
        }
      }
    }

    socket.onAny((event, ...args) => {
      console.log(`📥 [${socket.id}] Received ${event}:`, args);
    });

    socket.on('create-game', ({ code, maxPlayers, rooms, clientId }) => {
      console.log('Creating game:', { code, maxPlayers, rooms });
      
      try {
        // Check if game exists
        if (gameManager.verifyGame(code)) {
          socket.emit('game-error', { message: 'Game already exists' });
          return;
        }
        
        // Create the game
        const game = gameManager.createGame(code, maxPlayers, rooms);
        
        // Save admin session
        sessionManager.saveSession(clientId, {
          gameCode: code,
          isAdmin: true,
          lastActive: Date.now()
        });
        
        // Join socket to game room
        socket.join(code);
        
        // Emit success
        socket.emit('game-created', {
          code: game.code,
          maxPlayers: game.maxPlayers,
          rooms: game.rooms,
          players: game.players
        });
        
      } catch (error) {
        console.error('Error creating game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('join-game', ({ gameCode, player, clientId }) => {
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

        // Add player to game
        const players = gameManager.addPlayer(gameCode, player);
        
        // Save player session
        sessionManager.saveSession(clientId, {
          gameCode,
          playerId: player.id,
          lastActive: Date.now()
        });
        
        // Join socket to game room
        socket.join(gameCode);

        // Notify player of success
        socket.emit('join-game-success', { 
          gameCode,
          player,
          players
        });

        // Notify all players of update
        io.to(gameCode).emit('players-updated', players);
        
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('end-game', ({ code }) => {
      console.log('Ending game:', code);
      if (gameManager.endGame(code)) {
        io.to(code).emit('game-ended');
        
        // Clear all sessions for this game
        const gameSessions = sessionManager.getGameSessions(code);
        gameSessions.forEach(session => {
          sessionManager.removeSession(session.clientId);
        });
      }
    });

    socket.on('remove-player', ({ gameCode, playerId, clientId, isAdmin }) => {
      console.log('Removing player:', { gameCode, playerId, isAdmin });
      
      const game = gameManager.getGame(gameCode);
      if (!game) return;

      const players = gameManager.removePlayer(gameCode, playerId);
      
      // Clear player session if not admin action
      if (!isAdmin) {
        sessionManager.removeSession(clientId);
      }
      
      // Notify removed player
      socket.to(gameCode).emit('player-removed', { playerId });
      
      // Update all players
      io.to(gameCode).emit('players-updated', players);
    });
  });
}