import { handleConnection } from './handlers/connectionHandler.js';
import { handleGameEvents } from './handlers/gameHandler.js';
import { handlePlayerEvents, setupPlayerTimeouts } from './handlers/playerHandler.js';
import gameManager from './gameManager.js';

export default function setupSocketHandlers(io) {
  // Make gameManager globally available for session validation
  global.gameManager = gameManager;

  io.on('connection', (socket) => {
    handleConnection(socket);
    handleGameEvents(io, socket);
    handlePlayerEvents(io, socket);
  });

  setupPlayerTimeouts(io);
}