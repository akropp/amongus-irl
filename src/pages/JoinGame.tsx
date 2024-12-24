import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function JoinGame() {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const navigate = useNavigate();
  const { socketService, setGameCode: updateGameCode, addPlayer, reset } = useGameStore();

  // Clear game state on component mount
  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    const checkConnection = () => {
      const isConnected = socketService.isConnected();
      
      if (!isConnected && connectionAttempts < 5) {
        setIsConnecting(true);
        setConnectionAttempts(prev => prev + 1);
        socketService.reconnect();
        setTimeout(checkConnection, 2000);
      } else if (isConnected) {
        setIsConnecting(false);
        setConnectionAttempts(0);
      } else {
        setError('Unable to connect to server. Please refresh the page.');
        setIsConnecting(false);
      }
    };

    checkConnection();

    const handleJoinSuccess = ({ player, gameCode }) => {
      updateGameCode(gameCode);
      addPlayer(player);
      navigate(`/lobby/${player.id}`);
    };

    const handleJoinError = (error) => {
      setError(error.message);
      reset();
    };

    socketService.onJoinGameSuccess(handleJoinSuccess);
    socketService.onJoinGameError(handleJoinError);

    return () => {
      socketService.offJoinGameSuccess(handleJoinSuccess);
      socketService.offJoinGameError(handleJoinError);
    };
  }, [socketService, connectionAttempts, navigate, updateGameCode, addPlayer, reset]);

  const handleJoinGame = () => {
    setError('');
    
    if (!socketService.isConnected()) {
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

  // Rest of the component remains the same