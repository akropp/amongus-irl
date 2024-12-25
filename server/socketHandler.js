import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    
    // Log all incoming events
    socket.onAny((eventName, ...args) => {
      console.log(`📥 Received '${eventName}':`, args);
    });

    // Log all outgoing events
    const emit = socket.emit;
    socket.emit = function(eventName, ...args) {
      console.log(`📤 Emitting '${eventName}':`, args);
      return emit.apply(this, [eventName, ...args]);
    };

    socket.on('create-game', ({ code, maxPlayers, rooms, clientId }) => {
      console.log('🎮 Creating game:', { code, maxPlayers, rooms, clientId });
      
      try {
        if (gameManager.verifyGame(code)) {
          console.log('❌ Game already exists:', code);
          socket.emit('game-error', { message: 'Game already exists' });
          return;
        }
        
        const game = gameManager.createGame(code, maxPlayers, rooms);
        console.log('✅ Game created:', game);
        
        sessionManager.saveSession(clientId, { 
          gameCode: code,
          socketId: socket.id,
          isAdmin: true
        });
        
        socket.join(code);
        console.log('👥 Socket joined room:', code);
        
        socket.emit('game-created', { 
          code,
          maxPlayers,
          rooms,
          players: []
        });
        
      } catch (error) {
        console.error('❌ Error creating game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('join-game', ({ gameCode, player, clientId }) => {
      console.log('🎮 Join game attempt:', { gameCode, player, clientId });
      
      try {
        const game = gameManager.getGame(gameCode);
        
        if (!game) {
          console.log('❌ Game not found:', gameCode);
          socket.emit('game-error', { message: 'Game not found' });
          return;
        }

        if (game.players.length >= game.maxPlayers) {
          console.log('❌ Game is full:', gameCode);
          socket.emit('game-error', { message: 'Game is full' });
          return;
        }

        const players = gameManager.addPlayer(gameCode, player);
        console.log('✅ Player added:', player);
        
        sessionManager.saveSession(clientId, {
          gameCode,
          playerId: player.id,
          socketId: socket.id
        });
        
        socket.join(gameCode);
        console.log('👥 Socket joined room:', gameCode);

        socket.emit('join-game-success', { 
          gameCode,
          player,
          players
        });

        io.to(gameCode).emit('players-updated', players);
        
      } catch (error) {
        console.error('❌ Error joining game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
    });
  });
}