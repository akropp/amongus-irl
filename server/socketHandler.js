import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle reconnection attempts
    socket.on('register-player', ({ gameCode, playerId, clientId }) => {
      console.log('Player registration:', { gameCode, playerId, clientId });
      
      const game = gameManager.getGame(gameCode);
      if (!game) return;

      const player = game.players.find(p => p.id === playerId);
      if (!player) return;

      socket.join(gameCode);
      sessionManager.saveSession(clientId, { gameCode, playerId, socketId: socket.id });
      
      // Send current game state
      socket.emit('game-state', {
        gameCode,
        players: game.players,
        phase: game.phase
      });
    });

    socket.on('create-game', ({ code, maxPlayers, rooms, clientId }) => {
      console.log('Creating game:', { code, maxPlayers, rooms, clientId });
      try {
        let game = gameManager.getGame(code);
        if (game) {
          socket.emit('error', { message: 'Game already exists' });
          return;
        }
        
        game = gameManager.createGame(code, maxPlayers, rooms);
        socket.join(code);
        sessionManager.saveSession(clientId, { 
          gameCode: code, 
          socketId: socket.id,
          isAdmin: true 
        });
        
        socket.emit('game-created', { code, maxPlayers, rooms });
        
      } catch (error) {
        console.error('Error creating game:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('join-game', ({ gameCode, player, clientId }) => {
      console.log('Join attempt:', { gameCode, player, clientId });
      
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
        
        sessionManager.saveSession(clientId, { 
          gameCode, 
          playerId: player.id,
          socketId: socket.id 
        });

        socket.emit('join-game-success', { 
          player,
          gameCode,
          players: updatedPlayers
        });

        io.to(gameCode).emit('players-updated', updatedPlayers);
        
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('join-game-error', { message: error.message });
      }
    });

    socket.on('remove-player', ({ gameCode, playerId, clientId, isAdmin }) => {
      console.log('Remove player:', { gameCode, playerId, clientId, isAdmin });
      
      const session = sessionManager.getSession(clientId);
      if (!session && !isAdmin) return;

      const updatedPlayers = gameManager.removePlayer(gameCode, playerId);
      sessionManager.removeSession(clientId);
      
      io.to(gameCode).emit('players-updated', updatedPlayers);
      io.to(gameCode).emit('player-removed', { playerId });
    });

    socket.on('end-game', ({ code, clientId }) => {
      console.log('End game:', { code, clientId });
      
      const session = sessionManager.getSession(clientId);
      if (!session?.isAdmin) return;

      if (gameManager.endGame(code)) {
        sessionManager.removeSession(clientId);
        io.to(code).emit('game-ended');
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}