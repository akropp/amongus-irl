import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player } from '../types/game';
import SocketService from '../services/socketService';
import { sessionManager } from '../utils/sessionManager';

interface GameStore extends GameState {
  socketService: SocketService;
  setGameCode: (code: string | null) => void;
  updatePlayers: (players: Player[]) => void;
  setMaxPlayers: (count: number) => void;
  setPhase: (phase: GameState['phase']) => void;
  reset: () => void;
}

const initialState: Omit<GameStore, 'socketService' | 'setGameCode' | 'updatePlayers' | 'setMaxPlayers' | 'setPhase' | 'reset'> = {
  gameCode: null,
  players: [],
  maxPlayers: 15,
  phase: 'lobby',
  rooms: [],
  tasks: [],
  sabotages: []
};

const socketService = new SocketService();

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialState,
      socketService,

      setGameCode: (code) => {
        const normalizedCode = code ? code.toUpperCase() : null;
        set({ gameCode: normalizedCode });
        
        // Clear session if game code is cleared
        if (!normalizedCode) {
          sessionManager.clearSession();
        }
      },
      
      updatePlayers: (players) => set({ players }),
      
      setMaxPlayers: (count) => set({ maxPlayers: count }),
      
      setPhase: (phase) => set({ phase }),
      
      reset: () => {
        sessionManager.clearSession();
        set(state => ({
          ...initialState,
          socketService: state.socketService
        }));
      }
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        maxPlayers: state.maxPlayers
      })
    }
  )
);