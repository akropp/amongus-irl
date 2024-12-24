import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Player } from '../types/game';
import { clearGameSession } from '../utils/sessionHelpers';

export function useGameEvents(onPlayerRemoved?: (playerId: string) => void) {
  const { socketService, updatePlayers, setGameCode, gameCode } = useGameStore();

  useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      console.log('Players updated:', updatedPlayers);
      const currentPlayer = JSON.parse(localStorage.getItem('currentPlayer') || '{}');
      
      // Only update if we're still in a game and our player still exists
      if (gameCode && updatedPlayers.some(p => p.id === currentPlayer.id)) {
        updatePlayers(updatedPlayers);
      }
    };

    const handlePlayerRemoved = ({ playerId }: { playerId: string }) => {
      console.log('Player removed:', playerId);
      const currentPlayer = JSON.parse(localStorage.getItem('currentPlayer') || '{}');
      
      // Only handle removal if we're the removed player
      if (currentPlayer.id === playerId) {
        clearGameSession();
        if (onPlayerRemoved) {
          onPlayerRemoved(playerId);
        }
      }
    };

    const handleGameEnded = () => {
      console.log('Game ended');
      clearGameSession();
      setGameCode(null);
      updatePlayers([]);
    };

    socketService.onPlayersUpdated(handlePlayersUpdate);
    socketService.socket.on('player-removed', handlePlayerRemoved);
    socketService.socket.on('game-ended', handleGameEnded);

    return () => {
      socketService.offPlayersUpdated();
      socketService.socket.off('player-removed', handlePlayerRemoved);
      socketService.socket.off('game-ended', handleGameEnded);
    };
  }, [socketService, updatePlayers, setGameCode, onPlayerRemoved, gameCode]);
}