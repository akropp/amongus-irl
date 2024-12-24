import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Player } from '../types/game';

export function useGameEvents(onPlayerRemoved?: (playerId: string) => void) {
  const { socketService, updatePlayers } = useGameStore();

  useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      updatePlayers(updatedPlayers);
    };

    const handlePlayerRemoved = ({ playerId }: { playerId: string }) => {
      if (onPlayerRemoved) {
        onPlayerRemoved(playerId);
      }
    };

    socketService.socket.on('players-updated', handlePlayersUpdate);
    socketService.socket.on('player-removed', handlePlayerRemoved);

    return () => {
      socketService.socket.off('players-updated', handlePlayersUpdate);
      socketService.socket.off('player-removed', handlePlayerRemoved);
    };
  }, [socketService, updatePlayers, onPlayerRemoved]);
}