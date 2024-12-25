import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Debug middleware for all events
    socket.onAny((event, ...args) => {
      console.log(`📥 [${socket.id}] Received ${event}:`, args);
    });

    socket.on('create-game', ({ code, maxPlayers, rooms, clientId }) => {
      console.log('🎮 Creating game:', { code, maxPlayers, rooms, clientId });
      
      try {
        // Check if game exists
        if (gameManager.getGame(code)) {
          throw new Error('Game already exists');
        }

        const game = gameManager.createGame(code, maxPlayers, rooms);
        
        // Save admin session
        sessionManager.saveSession(clientId, { 
          gameCode: code,
          socketId: socket.id,
          isAdmin: true
        });
        
        socket.join(code);
        io.to(code).emit('game-created', { 
          code, 
          maxPlayers, 
          rooms,
          players: game.players 
        });
        
        console.log('✅ Game created:', code);
        
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

        if (game.players.length >= game.maxPlayers) {
          throw new Error('Game is full');
        }

        const players = gameManager.addPlayer(gameCode, player);
        
        // Save player session
        sessionManager.saveSession(clientId, {
          gameCode,
          playerId: player.id,
          socketId: socket.id
        });
        
        socket.join(gameCode);
        
        // Send success to joining player
        socket.emit('join-game-success', { 
          gameCode, 
          player, 
          players 
        });
        
        // Broadcast updated player list to all in game
        io.to(gameCode).emit('players-updated', players);
        
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

        // Send current game state
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
      console.log('👋 Remove player:', { gameCode, playerId, clientId, isAdmin });
      
      try {
        const game = gameManager.getGame(gameCode);
        if (!game) {
          throw new Error('Game not found');
        }

        const session = sessionManager.getSession(clientId);
        if (!session) {
          throw new Error('Invalid session');
        }

        // Only allow admin or the player themselves to remove
        if (!isAdmin && session.playerId !== playerId) {
          throw new Error('Unauthorized');
        }

        const players = gameManager.removePlayer(gameCode, playerId);
        
        // Notify all clients in the game
        io.to(gameCode).emit('players-updated', players);
        socket.to(gameCode).emit('player-removed', { playerId });
        
        console.log('✅ Player removed:', playerId);
        
      } catch (error) {
        console.error('❌ Remove error:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('end-game', ({ code }) => {
      console.log('🏁 End game:', code);
      
      try {
        const game = gameManager.getGame(code);
        if (!game) {
          throw new Error('Game not found');
        }

        gameManager.endGame(code);
        io.to(code).emit('game-ended');
        console.log('✅ Game ended:', code);
        
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