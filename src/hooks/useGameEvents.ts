import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Player } from '../types/game';
import { clearGameSession } from '../utils/sessionHelpers';

export function useGameEvents(onPlayerRemoved?: (playerId: string) => void) {
  const { socketService, updatePlayers, setGameCode } = useGameStore();

  useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      updatePlayers(updatedPlayers);
    };

    const handlePlayerRemoved = ({ playerId }: { playerId: string }) => {
      if (onPlayerRemoved) {
        onPlayerRemoved(playerId);
      }
    };

    const handleGameEnded = () => {
      clearGameSession();
      setGameCode(null);
      updatePlayers([]);
      window.location.href = '/';
    };

    socketService.socket.on('players-updated', handlePlayersUpdate);
    socketService.socket.on('player-removed', handlePlayerRemoved);
    socketService.socket.on('game-ended', handleGameEnded);

    return () => {
      socketService.socket.off('players-updated', handlePlayersUpdate);
      socketService.socket.off('player-removed', handlePlayerRemoved);
      socketService.socket.off('game-ended', handleGameEnded);
    };
  }, [socketService, updatePlayers, setGameCode, onPlayerRemoved]);
}