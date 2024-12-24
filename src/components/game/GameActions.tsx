import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';

interface GameActionsProps {
  playerId: string;
}

export function GameActions({ playerId }: GameActionsProps) {
  const navigate = useNavigate();
  const { gameCode, socketService, reset } = useGameStore();

  const handleLeaveGame = () => {
    if (gameCode && playerId) {
      socketService.removePlayer(gameCode, playerId);
      localStorage.removeItem('currentGameCode');
      localStorage.removeItem('currentPlayerId');
      localStorage.removeItem('currentPlayer');
      localStorage.removeItem('gamePhase');
      reset();
      navigate('/');
    }
  };

  return (
    <div className="flex justify-end">
      <button
        onClick={handleLeaveGame}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Leave Game
      </button>
    </div>
  );
}