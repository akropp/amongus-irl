import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { usePageRefresh } from '../hooks/usePageRefresh';
import { useSocket } from '../hooks/useSocket';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { GameActions } from '../components/game/GameActions';
import { LobbyPlayerList } from '../components/game/LobbyPlayerList';
import { getGameSession } from '../utils/sessionHelpers';

export default function Lobby() {
  const { playerId } = useParams();
  const { players, phase, gameCode, socketService } = useGameStore();
  const navigate = useNavigate();
  const isConnected = useSocket();
  
  usePageRefresh();

  const currentPlayer = players.find(p => p.id === playerId);

  useEffect(() => {
    if (isConnected) {
      const session = getGameSession();
      if (session.gameCode && session.player && !currentPlayer) {
        socketService.joinGame(session.gameCode, session.player);
      }
    }
  }, [isConnected, currentPlayer, socketService]);

  useEffect(() => {
    if (!currentPlayer || !gameCode) {
      navigate('/', { replace: true });
    }
  }, [currentPlayer, gameCode, navigate]);

  if (phase === 'playing') {
    navigate(`/game/${playerId}`);
    return null;
  }

  if (!currentPlayer || !gameCode) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {playerId && <GameActions playerId={playerId} />}
        
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