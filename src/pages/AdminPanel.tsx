import React, { useEffect } from 'react';
import { Users, PlayCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAdminStore } from '../store/adminStore';
import HomeAssistantSetup from '../components/admin/HomeAssistantSetup';
import RoomManager from '../components/admin/RoomManager';
import TaskCreator from '../components/admin/TaskCreator';
import MaxPlayersConfig from '../components/admin/MaxPlayersConfig';
import SabotageConfig from '../components/admin/SabotageConfig';

export default function AdminPanel() {
  const { 
    gameCode,
    players,
    setGameCode,
    removePlayer,
    reset,
    socketService
  } = useGameStore();

  const {
    isConnected: isHAConnected,
    rooms,
  } = useAdminStore();

  useEffect(() => {
    const handleGameCreated = ({ code }) => {
      setGameCode(code);
      localStorage.setItem('adminGameCode', code);
    };

    socketService.onGameCreated(handleGameCreated);
    
    return () => {
      socketService.offGameCreated();
    };
  }, [socketService, setGameCode]);

  useEffect(() => {
    socketService.onPlayersUpdated((updatedPlayers) => {
      useGameStore.getState().updatePlayers(updatedPlayers);
    });
  }, [socketService]);

  const handleCreateGame = () => {
    const newGameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    socketService.createGame(newGameCode, useGameStore.getState().maxPlayers, rooms);
  };

  const handleRemovePlayer = (playerId: string) => {
    if (gameCode) {
      socketService.removePlayer(gameCode, playerId);
    }
  };

  // Rest of the component remains the same...
}