import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Player } from '../types/game';
import { clearGameSession } from '../utils/sessionHelpers';

export function useGameEvents(onPlayerRemoved?: (playerId: string) => void) {
  const { socketService, updatePlayers, setGameCode, gameCode } = useGameStore();

  useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      console.log('Players updated:', updatedPlayers);
      // Only update if we're still in a game
      if (gameCode) {
        updatePlayers(updatedPlayers);
      }
    };

    const handlePlayerRemoved = ({ playerId }: { playerId: string }) => {
      console.log('Player removed:', playerId);
      const currentPlayer = JSON.parse(localStorage.getItem('currentPlayer') || '{}');
      if (currentPlayer.id === playerId) {
        localStorage.setItem('playerRemoved', 'true');
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
      window.location.href = '/';
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