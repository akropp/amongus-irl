import gameManager from './gameManager.js';
import playerManager from './playerManager.js';
import socketManager from './socketManager.js';
import { generateClientId } from './utils.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    // Get or generate client ID
    const clientId = socket.handshake.auth.clientId || generateClientId();
    console.log(`Client connected - Socket: ${socket.id}, Client ID: ${clientId}`);
    
    // Handle game creation
    socket.on('create-game', ({ code, maxPlayers, rooms }) => {
      console.log(`Creating game - Client: ${clientId}, Code: ${code}, Max Players: ${maxPlayers}`);
      try {
        let game = gameManager.getGame(code);
        if (game) {
          socket.emit('join-game-error', { message: 'Game already exists' });
          return;
        }
        
        game = gameManager.createGame(code, maxPlayers, rooms);
        socket.join(code);
        io.emit('game-created', { code, maxPlayers, rooms });
        
      } catch (error) {
        console.error('Error in create-game:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle player joining
    socket.on('join-game', ({ gameCode, player }) => {
      console.log(`Join game attempt - Client: ${clientId}, Code: ${gameCode}, Player:`, player);
      
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

        // Add player to game
        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        socketManager.registerSocket(socket.id, gameCode, player.id);
        
        socket.join(gameCode);
        
        // Notify the joining player
        socket.emit('join-game-success', { 
          player,
          gameCode,
          players: updatedPlayers
        });

        // Notify all players in the game
        io.to(gameCode).emit('players-updated', updatedPlayers);
        
      } catch (error) {
        console.error('Error in join-game:', error);
        socket.emit('join-game-error', { message: error.message });
      }
    });

    // Handle player reconnection
    socket.on('register-player', ({ gameCode, playerId }) => {
      console.log(`Player reconnection - Client: ${clientId}, Game: ${gameCode}, Player: ${playerId}`);
      
      const game = gameManager.getGame(gameCode);
      if (!game) {
        socket.emit('join-game-error', { message: 'Game not found' });
        return;
      }

      const player = game.players.find(p => p.id === playerId);
      if (!player) {
        socket.emit('join-game-error', { message: 'Player not found in game' });
        return;
      }

      socketManager.registerSocket(socket.id, gameCode, playerId);
      socket.join(gameCode);
      
      socket.emit('join-game-success', {
        player,
        gameCode,
        players: game.players
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected - Socket: ${socket.id}, Client ID: ${clientId}`);
      const playerInfo = socketManager.unregisterSocket(socket.id);
      
      if (playerInfo) {
        playerManager.handleDisconnect(
          playerInfo.gameCode,
          playerInfo.playerId,
          socket.id
        );
      }
    });
  });
}