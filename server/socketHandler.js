import gameManager from './gameManager.js';
import sessionManager from './sessionManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    const clientId = socket.handshake.auth.clientId;
    console.log(`Client connected - Socket: ${socket.id}, Client ID: ${clientId}`);
    
    // Restore session if exists
    const existingSession = sessionManager.getSession(clientId);
    if (existingSession) {
      console.log(`Restoring session for client ${clientId}:`, existingSession);
      socket.emit('session-restored', existingSession);
    }

    socket.on('create-game', ({ code, maxPlayers, rooms }) => {
      console.log(`Creating game - Code: ${code}, Max Players: ${maxPlayers}, Rooms:`, rooms);
      try {
        // Check if game exists first
        let game = gameManager.getGame(code);
        if (game) {
          socket.emit('game-error', { message: 'Game already exists' });
          return;
        }
        
        game = gameManager.createGame(code, maxPlayers, rooms);
        socket.join(code);
        
        // Save admin session
        sessionManager.saveSession(clientId, {
          type: 'admin',
          gameCode: code,
          page: '/admin'
        });

        io.emit('game-created', { code, maxPlayers, rooms });
        
      } catch (error) {
        console.error('Error in create-game:', error);
        socket.emit('game-error', { message: error.message });
      }
    });

    socket.on('join-game', ({ gameCode, player }) => {
      console.log(`Join game attempt - Code: ${gameCode}, Player:`, player);
      
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

        // Save player session
        sessionManager.saveSession(clientId, {
          type: 'player',
          gameCode,
          player,
          page: `/lobby/${player.id}`
        });

        socket.emit('join-game-success', { 
          player,
          gameCode,
          players: updatedPlayers
        });

        io.to(gameCode).emit('players-updated', updatedPlayers);
        
      } catch (error) {
        console.error('Error in join-game:', error);
        socket.emit('join-game-error', { message: error.message });
      }
    });

    socket.on('verify-game', ({ code }, callback) => {
      const exists = gameManager.verifyGame(code);
      callback({ exists });
    });

    socket.on('remove-player', ({ gameCode, playerId }) => {
      try {
        const game = gameManager.getGame(gameCode);
        if (!game) return;

        const updatedPlayers = gameManager.removePlayer(gameCode, playerId);
        
        // Remove player session if exists
        const playerSession = Array.from(sessionManager.sessions.entries())
          .find(([_, session]) => 
            session.type === 'player' && 
            session.player?.id === playerId && 
            session.gameCode === gameCode
          );
        
        if (playerSession) {
          sessionManager.removeSession(playerSession[0]);
        }

        io.to(gameCode).emit('players-updated', updatedPlayers);
        io.to(gameCode).emit('player-removed', { playerId });
        
        if (updatedPlayers.length === 0) {
          gameManager.endGame(gameCode);
          io.to(gameCode).emit('game-ended');
        }
      } catch (error) {
        console.error('Error removing player:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}