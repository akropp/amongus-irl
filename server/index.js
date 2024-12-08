import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import setupSocketHandlers from './socketHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Allow both development and production origins
const allowedOrigins = [
  'https://radiant-druid-cda853.netlify.app',
  'http://localhost:5173'
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  path: '/socket.io/'
});

// Enable CORS for regular HTTP requests
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Debug endpoint to check current games
app.get('/debug/games', (req, res) => {
  const gameManager = req.app.get('gameManager');
  res.json({
    games: Array.from(gameManager.games.entries()),
    players: Array.from(gameManager.players.entries())
  });
});

setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing HTTP server...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});