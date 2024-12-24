import React, { useEffect } from 'react';
import { Users } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Player } from '../../types/game';

interface LobbyPlayerListProps {
  currentPlayerId?: string;
}

export function LobbyPlayerList({ currentPlayerId }: LobbyPlayerListProps) {
  const { players, socketService, updatePlayers } = useGameStore();

  useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      updatePlayers(updatedPlayers);
    };

    const handlePlayerRemoved = ({ playerId }: { playerId: string }) => {
      if (playerId === currentPlayerId) {
        // Only redirect if the current player was removed
        window.location.href = '/';
      }
    };

    socketService.socket.on('players-updated', handlePlayersUpdate);
    socketService.socket.on('player-removed', handlePlayerRemoved);

    return () => {
      socketService.socket.off('players-updated', handlePlayersUpdate);
      socketService.socket.off('player-removed', handlePlayerRemoved);
    };
  }, [socketService, updatePlayers, currentPlayerId]);

  return (
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
              player.id === currentPlayerId 
                ? 'bg-purple-900/50 border border-purple-500'
                : 'bg-slate-700'
            }`}
          >
            {player.name}
            {player.id === currentPlayerId && (
              <span className="ml-2 text-sm text-purple-400">(You)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}