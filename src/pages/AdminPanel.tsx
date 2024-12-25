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
    maxPlayers
  } = useGameStore();

  const { rooms } = useAdminStore();
  const isConnected = useSocket();
  
  // Use socket events with admin flag
  useSocketEvents(true);

  useEffect(() => {
    const session = sessionManager.getSession();
    
    if (isConnected && session.gameCode) {
      console.log('Restoring admin session:', session.gameCode);
      socketService.socket.emit('register-session', {
        gameCode: session.gameCode,
        clientId: sessionManager.getClientId(),
        isAdmin: true
      });
      setGameCode(session.gameCode);
    }
    setIsInitializing(false);
  }, [isConnected, setGameCode, socketService.socket]);

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

    // Save admin session
    sessionManager.saveSession(newGameCode, null, true);
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