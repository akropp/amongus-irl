import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.onAny((event, ...args) => {
      console.log(`📥 [${socket.id}] Received ${event}:`, args);
    });

    socket.on('create-game', ({ code, maxPlayers, rooms, clientId }) => {
      console.log('Creating game:', { code, maxPlayers, rooms });
      
      try {
        // Check if game exists
        if (gameManager.verifyGame(code)) {
          throw new Error('Game already exists');
        }

        // Create new game
        const game = gameManager.createGame(code, maxPlayers, rooms);
        
        // Save admin session
        sessionManager.saveSession(clientId, {
          gameCode: code,
          socketId: socket.id,
          isAdmin: true
        });

        // Join socket to game room
        socket.join(code);

        // Emit success response
        socket.emit('game-created', {
          code: game.code,
          maxPlayers: game.maxPlayers,
          rooms: game.rooms,
          players: game.players
        });

        console.log('✅ Game created:', game);
      } catch (error) {
        console.error('❌ Game creation error:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('join-game', ({ gameCode, player, clientId }) => {
      console.log('Player joining:', { gameCode, player });
      
      try {
        const game = gameManager.getGame(gameCode);
        if (!game) {
          throw new Error('Game not found');
        }

        if (game.players.length >= game.maxPlayers) {
          throw new Error('Game is full');
        }

        // Add player to game
        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        
        // Save player session
        sessionManager.saveSession(clientId, {
          gameCode,
          playerId: player.id,
          socketId: socket.id,
          isAdmin: false
        });

        // Join socket to game room
        socket.join(gameCode);

        // Emit success to joining player
        socket.emit('join-game-success', {
          gameCode,
          player,
          players: updatedPlayers
        });

        // Broadcast updated players to all in game
        io.to(gameCode).emit('players-updated', updatedPlayers);
        
        console.log('✅ Player joined:', player.name);
      } catch (error) {
        console.error('❌ Join error:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('register-session', ({ gameCode, playerId, clientId, isAdmin }) => {
      console.log('🔄 Session registration:', { gameCode, playerId, clientId, isAdmin });
      
      try {
        const game = gameManager.getGame(gameCode);
        if (!game) {
          throw new Error('Game not found');
        }

        socket.join(gameCode);
        
        sessionManager.saveSession(clientId, {
          gameCode,
          playerId,
          socketId: socket.id,
          isAdmin
        });

        socket.emit('game-state', {
          gameCode,
          players: game.players,
          phase: game.phase
        });
        
        console.log('✅ Session registered');
      } catch (error) {
        console.error('❌ Registration error:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('remove-player', ({ gameCode, playerId, clientId, isAdmin }) => {
      console.log('Removing player:', { gameCode, playerId, isAdmin });
      
      try {
        const game = gameManager.getGame(gameCode);
        if (!game) {
          throw new Error('Game not found');
        }

        // Verify admin or self-removal
        const session = sessionManager.getSession(clientId);
        if (!session) {
          throw new Error('Invalid session');
        }

        if (!isAdmin && session.playerId !== playerId) {
          throw new Error('Unauthorized');
        }

        const updatedPlayers = gameManager.removePlayer(gameCode, playerId);
        
        // Notify removed player
        io.to(gameCode).emit('player-removed', { playerId });
        
        // Update player list for remaining players
        io.to(gameCode).emit('players-updated', updatedPlayers);

        console.log('✅ Player removed');
      } catch (error) {
        console.error('❌ Remove player error:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('end-game', ({ code }) => {
      console.log('Ending game:', code);
      
      try {
        if (gameManager.endGame(code)) {
          io.to(code).emit('game-ended');
          console.log('✅ Game ended');
        }
      } catch (error) {
        console.error('❌ End game error:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
}