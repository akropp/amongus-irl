import { create } from 'zustand';
import { GameState, Player } from '../types/game';
import SocketService from '../services/socketService';
import { useGameSettings } from './gameSettingsStore';

interface GameStore extends Omit<GameState, 'maxPlayers' | 'rooms' | 'tasks' | 'sabotages'> {
  socketService: SocketService;
  setGameCode: (code: string | null) => void;
  updatePlayers: (players: Player[]) => void;
  setPhase: (phase: GameState['phase']) => void;
  reset: () => void;
}

const initialState: Omit<GameStore, 'socketService' | 'setGameCode' | 'updatePlayers' | 'setPhase' | 'reset'> = {
  gameCode: null,
  players: [],
  phase: 'lobby'
};

const socketService = new SocketService();

export const useGameStore = create<GameStore>()((set) => ({
  ...initialState,
  socketService,
  setGameCode: (code) => set({ gameCode: code ? code.toUpperCase() : null }),
  updatePlayers: (players) => set({ players }),
  setPhase: (phase) => set({ phase }),
  reset: () => set({ ...initialState })
}));