import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player } from '../types/game';
import SocketService from '../services/socketService';

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

// Create a single socket service instance
const socketService = new SocketService();

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      socketService,

      setGameCode: (code) => {
        const normalizedCode = code ? code.toUpperCase() : null;
        set({ gameCode: normalizedCode });
        
        // Update session if code changes
        if (normalizedCode) {
          const session = get().socketService.socket.auth || {};
          get().socketService.socket.auth = {
            ...session,
            gameCode: normalizedCode
          };
        }
      },
      
      updatePlayers: (players) => {
        set({ players });
      },
      
      setMaxPlayers: (count) => set({ maxPlayers: count }),
      
      setPhase: (phase) => set({ phase }),
      
      reset: () => {
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