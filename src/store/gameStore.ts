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

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      socketService: new SocketService(),

      setGameCode: (code) => {
        set({ gameCode: code ? code.toUpperCase() : null });
      },
      
      addPlayer: (player) => {
        set(state => ({
          players: [...state.players.filter(p => p.id !== player.id), player]
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
        const socketService = get().socketService;
        set({ ...initialState, socketService });
      }
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        gameCode: state.gameCode,
        maxPlayers: state.maxPlayers,
        phase: state.phase
      })
    }
  )
);