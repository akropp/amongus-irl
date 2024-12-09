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
  transports: ['websocket', 'polling']
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
  const games = Array.from(io.sockets.adapter.rooms.entries())
    .filter(([key]) => !key.startsWith('/'));
  
  res.json({
    connections: io.engine.clientsCount,
    rooms: games,
    uptime: process.uptime()
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