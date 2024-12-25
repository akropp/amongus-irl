import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../utils/sessionManager';

export function useSocketInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { socketService } = useGameStore();

  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected');
      
      // Try to restore session
      if (sessionManager.isValidSession()) {
        const session = sessionManager.getSession();
        socketService.socket.emit('register-session', {
          gameCode: session.gameCode,
          playerId: session.playerId,
          clientId: sessionManager.getClientId(),
          isAdmin: session.isAdmin
        });
      }
      
      setIsInitialized(true);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
    };

    const handleGameState = (state: any) => {
      console.log('Received game state:', state);
      useGameStore.getState().setGameCode(state.gameCode);
      useGameStore.getState().updatePlayers(state.players);
      useGameStore.getState().setPhase(state.phase);
    };

    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('disconnect', handleDisconnect);
    socketService.socket.on('game-state', handleGameState);

    if (socketService.socket.connected) {
      handleConnect();
    }

    return () => {
      socketService.socket.off('connect', handleConnect);
      socketService.socket.off('disconnect', handleDisconnect);
      socketService.socket.off('game-state', handleGameState);
    };
  }, [socketService]);

  return isInitialized;
}