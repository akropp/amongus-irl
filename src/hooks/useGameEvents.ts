import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Player } from '../types/game';
import { clearGameSession } from '../utils/sessionHelpers';
import { useNavigate } from 'react-router-dom';

export function useGameEvents(onPlayerRemoved?: (playerId: string) => void) {
  const { socketService, updatePlayers, setGameCode, gameCode, reset } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      console.log('Players updated:', updatedPlayers);
      const currentPlayer = JSON.parse(localStorage.getItem('currentPlayer') || '{}');
      
      if (!currentPlayer.id) return;

      // Check if our player still exists in the game
      const stillInGame = updatedPlayers.some(p => p.id === currentPlayer.id);
      
      if (gameCode && stillInGame) {
        updatePlayers(updatedPlayers);
      } else if (!stillInGame && !localStorage.getItem('playerRemoved')) {
        // Only handle disconnection if we didn't voluntarily leave
        console.log('Player no longer in game, redirecting to join page');
        clearGameSession();
        reset();
        navigate('/', { replace: true });
      }
    };

    const handlePlayerRemoved = ({ playerId }: { playerId: string }) => {
      console.log('Player removed:', playerId);
      const currentPlayer = JSON.parse(localStorage.getItem('currentPlayer') || '{}');
      
      if (currentPlayer.id === playerId) {
        clearGameSession();
        reset();
        if (onPlayerRemoved) {
          onPlayerRemoved(playerId);
        }
        navigate('/', { replace: true });
      }
    };

    const handleGameEnded = () => {
      console.log('Game ended');
      clearGameSession();
      reset();
      navigate('/', { replace: true });
    };

    const handleReconnect = () => {
      console.log('Socket reconnected, rejoining game');
      const currentPlayer = JSON.parse(localStorage.getItem('currentPlayer') || '{}');
      const currentGameCode = localStorage.getItem('currentGameCode');
      
      if (currentGameCode && currentPlayer.id) {
        socketService.joinGame(currentGameCode, currentPlayer);
      }
    };

    socketService.socket.on('connect', handleReconnect);
    socketService.onPlayersUpdated(handlePlayersUpdate);
    socketService.socket.on('player-removed', handlePlayerRemoved);
    socketService.socket.on('game-ended', handleGameEnded);

    return () => {
      socketService.socket.off('connect', handleReconnect);
      socketService.offPlayersUpdated();
      socketService.socket.off('player-removed', handlePlayerRemoved);
      socketService.socket.off('game-ended', handleGameEnded);
    };
  }, [socketService, updatePlayers, setGameCode, onPlayerRemoved, gameCode, reset, navigate]);
}