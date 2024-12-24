import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAdminStore } from '../store/adminStore';
import HomeAssistantSetup from '../components/admin/HomeAssistantSetup';
import RoomManager from '../components/admin/RoomManager';
import TaskCreator from '../components/admin/TaskCreator';
import MaxPlayersConfig from '../components/admin/MaxPlayersConfig';
import SabotageConfig from '../components/admin/SabotageConfig';
import PlayerManager from '../components/admin/PlayerManager';
import GameControls from '../components/admin/GameControls';
import { useSocket } from '../hooks/useSocket';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function AdminPanel() {
  const [error, setError] = useState('');
  const { 
    gameCode,
    setGameCode,
    socketService,
    maxPlayers
  } = useGameStore();

  const { rooms } = useAdminStore();
  const isConnected = useSocket();

  useEffect(() => {
    const handleGameCreated = (data) => {
      console.log('Game created:', data);
      setGameCode(data.code);
    };

    socketService.socket.on('game-created', handleGameCreated);
    return () => socketService.socket.off('game-created', handleGameCreated);
  }, [socketService, setGameCode]);

  if (!isConnected) {
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
      rooms
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

        {gameCode && (
          <div className="mt-8">
            <PlayerManager />
          </div>
        )}
      </div>
    </div>
  );
}