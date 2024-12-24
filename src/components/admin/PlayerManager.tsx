import React from 'react';
import { Users, UserX } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Player } from '../../types/game';
import { sessionManager } from '../../utils/sessionManager';

export default function PlayerManager() {
  const { players, gameCode, socketService } = useGameStore();
  
  const handleRemovePlayer = (player: Player) => {
    if (!gameCode) return;
    
    console.log('Admin removing player:', { gameCode, playerId: player.id });
    socketService.socket.emit('remove-player', { 
      gameCode, 
      playerId: player.id,
      clientId: sessionManager.getClientId(),
      isAdmin: true
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Connected Players ({players.length})
      </h2>

      {players.length === 0 ? (
        <p className="text-gray-400">No players connected</p>
      ) : (
        <div className="space-y-2">
          {players.map(player => (
            <div
              key={player.id}
              className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
            >
              <div>
                <p className="font-medium">{player.name}</p>
                <p className="text-sm text-gray-400">ID: {player.id}</p>
              </div>
              <button
                onClick={() => handleRemovePlayer(player)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                title="Remove player"
              >
                <UserX className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}