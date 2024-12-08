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
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Debug endpoint to check game state
app.get('/debug/games', (req, res) => {
  const games = Array.from(gameManager.games.entries()).map(([code, game]) => ({
    code,
    players: gameManager.getPlayers(code),
    ...game
  }));
  res.json(games);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});