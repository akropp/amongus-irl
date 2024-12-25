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

  // Rest of component remains the same...