import { io, Socket } from 'socket.io-client';

// Determine the Socket.IO server URL based on the environment
const SOCKET_URL = import.meta.env.PROD 
  ? 'https://amongus-irl-backend.onrender.com'  // Your Render.com URL
  : 'http://localhost:3000';

const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 2000;

// Rest of the file remains unchanged...