import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, PlayCircle, Hash } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { usePageRefresh } from '../hooks/usePageRefresh';
import { useSocket } from '../hooks/useSocket';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function Lobby() {
  const { playerId } = useParams();
  const { players, phase, gameCode, socketService } = useGameStore();
  const navigate = useNavigate();
  const isConnected = useSocket();
  
  // Handle page refresh and navigation
  usePageRefresh();

  // Verify valid game session
  useEffect(() => {
    const savedGameCode = localStorage.getItem('currentGameCode');
    const savedPlayerId = localStorage.getItem('currentPlayerId');
    
    if (!savedGameCode || !savedPlayerId || savedPlayerId !== playerId) {
      navigate('/');
      return;
    }

    const currentPlayer = players.find(p => p.id === playerId);
    if (!currentPlayer && isConnected) {
      navigate('/');
    }
  }, [playerId, players, isConnected, navigate]);

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

  if (!currentPlayer || !gameCode) {
    return <LoadingSpinner />;
  }

  if (phase === 'playing') {
    navigate(`/game/${playerId}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Game Lobby</h1>
          <p className="text-xl text-purple-400">Welcome, {currentPlayer.name}!</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Game Code</h2>
          <p className="text-3xl font-mono font-bold text-purple-400">{gameCode}</p>
          <p className="mt-2 text-gray-400">Share this code with other players</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Players ({players.length})
          </h2>
          <ul className="space-y-2">
            {players.map(player => (
              <li
                key={player.id}
                className={`p-3 rounded-lg ${
                  player.id === playerId 
                    ? 'bg-purple-900/50 border border-purple-500'
                    : 'bg-slate-700'
                }`}
              >
                {player.name}
                {player.id === playerId && (
                  <span className="ml-2 text-sm text-purple-400">(You)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}