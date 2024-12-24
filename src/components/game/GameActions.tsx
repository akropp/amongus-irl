import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { sessionManager } from '../../utils/sessionManager';

interface GameActionsProps {
  playerId: string;
}

export function GameActions({ playerId }: GameActionsProps) {
  const navigate = useNavigate();
  const { gameCode, socketService, reset } = useGameStore();

  const handleLeaveGame = () => {
    if (gameCode && playerId) {
      // Mark player as removed before sending the request
      sessionManager.markPlayerRemoved();
      
      // Emit remove player event
      socketService.socket.emit('remove-player', { gameCode, playerId });
      
      // Clear session and reset store
      sessionManager.clearSession();
      reset();
      
      // Navigate back to join page
      navigate('/', { replace: true });
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