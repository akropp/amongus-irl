import gameManager from './gameManager.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    let currentGame = null;
    let currentPlayer = null;

    socket.on('create-game', ({ code, maxPlayers, rooms }) => {
      console.log(`Creating game - Code: ${code}, Max Players: ${maxPlayers}, Rooms:`, rooms);
      try {
        // Check if game exists first
        let game = gameManager.getGame(code);
        if (game) {
          socket.emit('join-game-error', { message: 'Game already exists' });
          return;
        }
        
        game = gameManager.createGame(code, maxPlayers, rooms);
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
        
        if (!game) {
          socket.emit('join-game-error', { message: 'Game not found' });
          return;
        }

        if (game.players.length >= game.maxPlayers) {
          socket.emit('join-game-error', { message: 'Game is full' });
          return;
        }

        // Add player to the game
        const updatedPlayers = gameManager.addPlayer(gameCode, player);
        currentGame = gameCode;
        currentPlayer = player;
        
        socket.join(gameCode);

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

    // Rest of the socket handlers remain the same...
  });
}