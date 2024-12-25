import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useSocket } from '../hooks/useSocket';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { sessionManager } from '../utils/sessionManager';

export default function JoinGame() {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { socketService, setGameCode: updateGameCode, updatePlayers, reset } = useGameStore();
  const isConnected = useSocket();

  useEffect(() => {
    reset();
    sessionManager.clearSession();
  }, [reset]);

  const handleJoinGame = () => {
    setError('');
    setIsLoading(true);
    
    if (!isConnected) {
      setError('Not connected to server');
      setIsLoading(false);
      return;
    }

    const normalizedCode = gameCode.trim().toUpperCase();
    
    if (!normalizedCode || !playerName.trim()) {
      setError('Please enter both game code and name');
      setIsLoading(false);
      return;
    }

    const newPlayer = {
      id: Math.random().toString(36).substring(2),
      name: playerName.trim(),
      role: 'unassigned',
      isAlive: true,
      tasks: []
    };

    // Save session before joining
    sessionManager.saveSession(normalizedCode, newPlayer);
    
    // Update store and emit join
    updateGameCode(normalizedCode);
    socketService.socket.emit('join-game', {
      gameCode: normalizedCode,
      player: newPlayer,
      clientId: sessionManager.getClientId()
    });
  };

  useEffect(() => {
    const handleJoinSuccess = (data) => {
      console.log('Join success:', data);
      updateGameCode(data.gameCode);
      updatePlayers(data.players);
      setIsLoading(false);
      navigate(`/lobby/${data.player.id}`, { replace: true });
    };

    const handleError = (error) => {
      console.error('Join error:', error);
      sessionManager.clearSession();
      setError(error.message);
      setIsLoading(false);
    };

    socketService.socket.on('join-game-success', handleJoinSuccess);
    socketService.socket.on('game-error', handleError);

    return () => {
      socketService.socket.off('join-game-success', handleJoinSuccess);
      socketService.socket.off('game-error', handleError);
    };
  }, [socketService.socket, navigate, updateGameCode, updatePlayers]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
          {error && (
            <div className="bg-red-900/50 text-red-200 p-3 rounded-md text-sm">
              {error}
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

          <button
            onClick={handleJoinGame}
            disabled={!gameCode || !playerName || !isConnected}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}