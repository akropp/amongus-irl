import gameManager from './gameManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    let currentGame = null;
    let currentPlayer = null;

    socket.emit('connection_established', { id: socket.id });

    socket.on('create-game', ({ code, maxPlayers, rooms }) => {
      console.log(`Creating game - Code: ${code}, Max Players: ${maxPlayers}, Rooms:`, rooms);
      try {
        // Check if game already exists
        let game = gameManager.getGame(code);
        if (!game) {
          game = gameManager.createGame(code, maxPlayers, rooms);
          console.log('Game created successfully:', game);
        }
        
        currentGame = code;
        socket.join(code);
        io.emit('game-created', { code, maxPlayers, rooms });
        
      } catch (error) {
        console.error('Error in create-game:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('join-game', ({ gameCode, player }) => {
      console.log(`Join game attempt - Code: ${gameCode}, Player:`, player);
      
      try {
        const game = gameManager.getGame(gameCode);
        console.log('Found game:', game);
        
        if (!game) {
          console.log('Game not found for code:', gameCode);
          socket.emit('join-game-error', { message: 'Invalid game code' });
          return;
        }

        // Add player to the game
        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        console.log(`Player ${player.name} joined game ${gameCode}. Total players:`, updatedPlayers.length);
        
        currentGame = gameCode;
        currentPlayer = player;
        
        // Join the socket room for this game
        socket.join(gameCode);

        // Send success to the joining player
        socket.emit('join-game-success', { 
          player,
          gameCode,
          players: updatedPlayers
        });

        // Broadcast updated player list to all players in the game
        io.to(gameCode).emit('players-updated', updatedPlayers);
        
      } catch (error) {
        console.error('Error in join-game:', error);
        socket.emit('join-game-error', { message: error.message });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
      if (currentGame && currentPlayer) {
        const updatedPlayers = gameManager.removePlayer(currentGame, currentPlayer.id);
        io.to(currentGame).emit('players-updated', updatedPlayers);
      }
    });
  });
}