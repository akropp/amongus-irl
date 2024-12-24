import gameManager from './gameManager.js';
import playerManager from './playerManager.js';
import socketManager from './socketManager.js';
import { generateClientId } from './utils.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    // Generate or restore client ID
    const clientId = socket.handshake.auth.clientId || generateClientId();
    console.log(`Client connected - Socket: ${socket.id}, Client ID: ${clientId}`);
    
    socket.on('create-game', ({ code, maxPlayers, rooms }) => {
      console.log(`Creating game - Client: ${clientId}, Code: ${code}, Max Players: ${maxPlayers}`);
      try {
        // Check if game exists first
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

    // Rest of the handlers remain the same...
  });
}