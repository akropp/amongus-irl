import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, PlayCircle, Hash } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { usePageRefresh } from '../hooks/usePageRefresh';
import { useSocket } from '../hooks/useSocket';

export default function Lobby() {
  const { playerId } = useParams();
  const { players, phase, gameCode, socketService } = useGameStore();
  const navigate = useNavigate();
  const isConnected = useSocket();
  
  // Handle page refresh and navigation
  usePageRefresh();

  // Handle socket events
  useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers) => {
      useGameStore.getState().updatePlayers(updatedPlayers);
    };

    const handleGameStart = () => {
      useGameStore.getState().setPhase('playing');
      navigate(`/game/${playerId}`);
    };

    socketService.onPlayersUpdated(handlePlayersUpdate);
    socketService.onGameStarted(handleGameStart);

    return () => {
      socketService.offPlayersUpdated();
      socketService.offGameStarted();
    };
  }, [socketService, navigate, playerId]);

  const currentPlayer = players.find(p => p.id === playerId);

  // Handle reconnection if needed
  useEffect(() => {
    if (!currentPlayer && isConnected) {
      const savedGameCode = localStorage.getItem('currentGameCode');
      const savedPlayer = localStorage.getItem('currentPlayer');
      
      if (savedGameCode && savedPlayer) {
        socketService.joinGame(savedGameCode, JSON.parse(savedPlayer));
      } else {
        // If no saved data, redirect to join page
        navigate('/');
      }
    }
  }, [currentPlayer, isConnected, socketService, navigate]);

  if (!currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-400">
          Reconnecting to game...
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    navigate(`/game/${playerId}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      {/* Rest of the JSX remains the same */}
    </div>
  );
}