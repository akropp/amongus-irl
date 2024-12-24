import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAdminStore } from '../store/adminStore';
import HomeAssistantSetup from '../components/admin/HomeAssistantSetup';
import RoomManager from '../components/admin/RoomManager';
import TaskCreator from '../components/admin/TaskCreator';
import MaxPlayersConfig from '../components/admin/MaxPlayersConfig';
import SabotageConfig from '../components/admin/SabotageConfig';
import PlayerManager from '../components/admin/PlayerManager';
import { useSocketInit } from '../hooks/useSocketInit';
import { useGameVerification } from '../hooks/useGameVerification';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function AdminPanel() {
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const { 
    gameCode,
    setGameCode,
    socketService,
  } = useGameStore();

  const { rooms } = useAdminStore();
  const isSocketInitialized = useSocketInit();
  
  useGameVerification();

  React.useEffect(() => {
    if (isSocketInitialized) {
      setIsInitializing(false);
    }
  }, [isSocketInitialized]);

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  const handleCreateGame = () => {
    if (!isSocketInitialized) {
      setError('Not connected to server');
      return;
    }
    const newGameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    socketService.createGame(newGameCode, useGameStore.getState().maxPlayers, rooms);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          {!gameCode ? (
            <button
              onClick={handleCreateGame}
              disabled={!isSocketInitialized}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <PlayCircle className="w-5 h-5" />
              Create New Game
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <p className="text-xl">
                Game Code: <span className="font-mono font-bold text-purple-400">{gameCode}</span>
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {gameCode && <PlayerManager />}
          <HomeAssistantSetup />
          <MaxPlayersConfig />
          <RoomManager />
          <TaskCreator />
          <SabotageConfig />
        </div>
      </div>
    </div>
  );
}