import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { GameActions } from '../components/game/GameActions';
import { LobbyPlayerList } from '../components/game/LobbyPlayerList';
import { sessionManager } from '../utils/sessionManager';

export default function Lobby() {
  const { playerId } = useParams();
  const { players, phase, gameCode, socketService } = useGameStore();
  const navigate = useNavigate();

  // Use socket events for real-time updates
  useSocketEvents();

  // Initial session check and socket registration
  useEffect(() => {
    const session = sessionManager.getSession();
    
    if (!session.gameCode || !session.playerId || !playerId) {
      console.log('No valid session found in Lobby');
      sessionManager.clearSession();
      navigate('/', { replace: true });
      return;
    }

    // Verify we're in the correct game
    if (session.playerId !== playerId) {
      console.log('Session mismatch, redirecting');
      sessionManager.clearSession();
      navigate('/', { replace: true });
      return;
    }

    // Register session with server if connected
    if (socketService.socket.connected) {
      console.log('Registering lobby session');
      socketService.socket.emit('register-session', {
        gameCode: session.gameCode,
        playerId: session.playerId,
        clientId: sessionManager.getClientId(),
        isAdmin: false
      });
    }
  }, [playerId, navigate, socketService.socket]);

  // Handle game phase changes
  useEffect(() => {
    if (phase === 'playing') {
      navigate(`/game/${playerId}`);
    }
  }, [phase, playerId, navigate]);

  // Verify player is still in game
  useEffect(() => {
    if (players.length > 0 && playerId) {
      const playerExists = players.some(p => p.id === playerId);
      if (!playerExists && !sessionManager.wasPlayerRemoved()) {
        console.log('Player no longer in game');
        sessionManager.clearSession();
        navigate('/', { replace: true });
      }
    }
  }, [players, playerId, navigate]);

  const currentPlayer = players.find(p => p.id === playerId);

  if (!currentPlayer || !gameCode) {
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