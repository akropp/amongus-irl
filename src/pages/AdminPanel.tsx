import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGameSettings } from '../store/gameSettingsStore';
import { useAdminStore } from '../store/adminStore';
import HomeAssistantSetup from '../components/admin/HomeAssistantSetup';
import RoomManager from '../components/admin/RoomManager';
import TaskCreator from '../components/admin/TaskCreator';
import MaxPlayersConfig from '../components/admin/MaxPlayersConfig';
import SabotageConfig from '../components/admin/SabotageConfig';
import PlayerManager from '../components/admin/PlayerManager';
import GameControls from '../components/admin/GameControls';
import { useSocket } from '../hooks/useSocket';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { sessionManager } from '../utils/sessionManager';

export default function AdminPanel() {
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const { 
    gameCode,
    setGameCode,
    socketService,
    updatePlayers,
    players
  } = useGameStore();

  const { maxPlayers, rooms } = useGameSettings();
  const isConnected = useSocket();
  
  useSocketEvents();

  useEffect(() => {
    const handleGameCreated = (data) => {
      console.log('Game created:', data);
      setGameCode(data.code);
      updatePlayers(data.players);
      sessionManager.saveSession(data.code, null, true);
    };

    const handleGameState = (state) => {
      console.log('Received game state:', state);
      setGameCode(state.gameCode);
      updatePlayers(state.players);
    };

    const handleGameError = (error) => {
      console.error('Game error:', error);
      setError(error.message);
      if (error.message.includes('Game not found')) {
        setGameCode(null);
      }
    };

    socketService.socket.on('game-created', handleGameCreated);
    socketService.socket.on('game-state', handleGameState);
    socketService.socket.on('game-error', handleGameError);

    setIsInitializing(false);

    return () => {
      socketService.socket.off('game-created', handleGameCreated);
      socketService.socket.off('game-state', handleGameState);
      socketService.socket.off('game-error', handleGameError);
    };
  }, [socketService.socket, setGameCode, updatePlayers]);

  if (!isConnected || isInitializing) {
    return <LoadingSpinner />;
  }

  const handleCreateGame = () => {
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }

    const newGameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('Creating game:', { code: newGameCode, maxPlayers, rooms });
    
    socketService.socket.emit('create-game', { 
      code: newGameCode,
      maxPlayers,
      rooms,
      clientId: sessionManager.getClientId()
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <GameControls 
          onCreateGame={handleCreateGame}
          isSocketInitialized={isConnected}
        />

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <HomeAssistantSetup />
          <MaxPlayersConfig />
          <RoomManager />
          <TaskCreator />
          <SabotageConfig />
        </div>

        {gameCode && players.length > 0 && (
          <div className="mt-8">
            <PlayerManager />
          </div>
        )}
      </div>
    </div>
  );