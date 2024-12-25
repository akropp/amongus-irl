import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player } from '../types/game';
import SocketService from '../services/socketService';

interface GameStore extends GameState {
  socketService: SocketService;
  setGameCode: (code: string | null) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayers: (players: Player[]) => void;
  setMaxPlayers: (count: number) => void;
  setPhase: (phase: GameState['phase']) => void;
  reset: () => void;
}

const initialState: Omit<GameStore, 'socketService' | 'setGameCode' | 'addPlayer' | 'removePlayer' | 'updatePlayers' | 'setMaxPlayers' | 'setPhase' | 'reset'> = {
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
    (set) => ({
      ...initialState,
      socketService,

      setGameCode: (code) => {
        set({ gameCode: code ? code.toUpperCase() : null });
      },
      
      addPlayer: (player) => {
        set(state => ({
          players: state.players.some(p => p.id === player.id)
            ? state.players.map(p => p.id === player.id ? player : p)
            : [...state.players, player]
        }));
      },
      
      updatePlayers: (players) => set({ players }),
      
      removePlayer: (playerId) => {
        set(state => ({
          players: state.players.filter(p => p.id !== playerId)
        }));
      },
      
      setMaxPlayers: (count) => set({ maxPlayers: count }),
      
      setPhase: (phase) => set({ phase }),
      
      reset: () => {
        set(initialState);
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