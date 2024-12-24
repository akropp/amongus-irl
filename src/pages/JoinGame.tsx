import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useSocket } from '../hooks/useSocket';

export default function JoinGame() {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { socketService, setGameCode: updateGameCode, addPlayer, reset } = useGameStore();
  const isConnected = useSocket();

  // Check for existing session on mount
  useEffect(() => {
    const savedGameCode = localStorage.getItem('currentGameCode');
    const savedPlayerId = localStorage.getItem('currentPlayerId');
    
    if (savedGameCode && savedPlayerId) {
      navigate(`/lobby/${savedPlayerId}`);
    } else {
      reset();
      localStorage.removeItem('currentGameCode');
      localStorage.removeItem('currentPlayerId');
      localStorage.removeItem('currentPlayer');
    }
  }, [navigate, reset]);

  useEffect(() => {
    const handleJoinSuccess = ({ player, gameCode, players }) => {
      console.log('Join success:', { player, gameCode, players });
      updateGameCode(gameCode);
      // Update all players
      players.forEach(p => addPlayer(p));
      
      // Save current player data
      localStorage.setItem('currentGameCode', gameCode);
      localStorage.setItem('currentPlayerId', player.id);
      localStorage.setItem('currentPlayer', JSON.stringify(player));
      localStorage.setItem('gamePhase', 'lobby');
      
      navigate(`/lobby/${player.id}`);
    };

    const handleJoinError = (error) => {
      console.error('Join error:', error);
      setError(error.message);
    };

    socketService.onJoinGameSuccess(handleJoinSuccess);
    socketService.onJoinGameError(handleJoinError);

    return () => {
      socketService.offJoinGameSuccess();
      socketService.offJoinGameError();
    };
  }, [socketService, navigate, updateGameCode, addPlayer]);

  const handleJoinGame = () => {
    setError('');
    
    if (!isConnected) {
      setError('Not connected to server. Please try again.');
      return;
    }

    const normalizedInputCode = gameCode.trim().toUpperCase();
    
    if (!normalizedInputCode) {
      setError('Please enter a game code');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    const newPlayer = {
      id: Math.random().toString(36).substring(2),
      name: playerName.trim(),
      role: 'unassigned',
      isAlive: true,
      tasks: []
    };
    
    socketService.joinGame(normalizedInputCode, newPlayer);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      {/* Rest of the JSX remains the same */}
    </div>
  );
}