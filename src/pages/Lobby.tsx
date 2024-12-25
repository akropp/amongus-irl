import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useSocket } from '../hooks/useSocket';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { GameActions } from '../components/game/GameActions';
import { LobbyPlayerList } from '../components/game/LobbyPlayerList';
import { sessionManager } from '../utils/sessionManager';

export default function Lobby() {
  const { playerId } = useParams();
  const { players, phase, gameCode, socketService } = useGameStore();
  const navigate = useNavigate();
  const isConnected = useSocket();
  
  // Use socket events for real-time updates
  useSocketEvents();

  // Handle session restoration and validation
  useEffect(() => {
    const session = sessionManager.getSession();
    
    // Redirect to join page if no valid session
    if (!session.gameCode || !session.playerId || !playerId) {
      console.log('No valid session found, redirecting to join page');
      sessionManager.clearSession();
      navigate('/', { replace: true });
      return;
    }

    // Register session with server if connected
    if (isConnected) {
      console.log('Registering lobby session');
      socketService.socket.emit('register-session', {
        gameCode: session.gameCode,
        playerId: session.playerId,
        clientId: sessionManager.getClientId()
      });
    }
  }, [isConnected, playerId, navigate, socketService.socket]);

  // Handle game phase changes
  useEffect(() => {
    if (phase === 'playing') {
      navigate(`/game/${playerId}`);
    }
  }, [phase, playerId, navigate]);

  const currentPlayer = players.find(p => p.id === playerId);

  if (!isConnected || !currentPlayer || !gameCode) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <GameActions playerId={playerId} />
        
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Game Lobby</h1>
          <p className="text-xl text-purple-400">Welcome, {currentPlayer.name}!</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Game Code</h2>
          <p className="text-3xl font-mono font-bold text-purple-400">{gameCode}</p>
          <p className="mt-2 text-gray-400">Share this code with other players</p>
        </div>

        <LobbyPlayerList currentPlayerId={playerId} />
      </div>
    </div>
  );
}