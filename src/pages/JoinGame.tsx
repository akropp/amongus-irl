import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function JoinGame() {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();
  const store = useGameStore();

  useEffect(() => {
    // Check socket connection
    if (!store.socketService.isConnected()) {
      setIsConnecting(true);
      store.socketService.reconnect();
    }
  }, [store.socketService]);

  const handleJoinGame = () => {
    setError('');
    
    if (!store.socketService.isConnected()) {
      setError('Not connected to server. Please try again.');
      return;
    }

    // Normalize game codes to uppercase for comparison
    const normalizedInputCode = gameCode.trim().toUpperCase();
    const normalizedStoreCode = store.gameCode.trim().toUpperCase();
    
    if (!normalizedInputCode) {
      setError('Please enter a game code');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    console.log('Attempting to join game:', {
      inputCode: normalizedInputCode,
      storeCode: normalizedStoreCode
    });

    if (normalizedInputCode !== normalizedStoreCode) {
      setError('Invalid game code');
      return;
    }

    if (store.players.length >= store.maxPlayers) {
      setError('Game is full');
      return;
    }

    if (store.players.some(p => p.name.toLowerCase() === playerName.trim().toLowerCase())) {
      setError('Name already taken');
      return;
    }

    const newPlayer = {
      id: Math.random().toString(36).substring(2),
      name: playerName.trim(),
      role: 'crewmate',
      isAlive: true,
      tasks: []
    };
    
    store.addPlayer(newPlayer);
    navigate(`/game/${newPlayer.id}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Ghost className="mx-auto h-16 w-16 text-purple-400" />
          <h2 className="mt-6 text-3xl font-bold text-white">
            Join Among Us Game
          </h2>
        </div>
        
        <div className="mt-8 space-y-6">
          {isConnecting && (
            <div className="bg-blue-900/50 text-blue-200 p-3 rounded-md text-sm">
              Connecting to server...
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="gameCode" className="block text-sm font-medium text-gray-300">
                Game Code
              </label>
              <input
                id="gameCode"
                type="text"
                required
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter game code"
                maxLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-300">
                Your Name
              </label>
              <input
                id="playerName"
                type="text"
                required
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleJoinGame}
            disabled={!gameCode || !playerName || isConnecting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Join Game'}
          </button>
        </div>
      </div>
    </div>
  );
}