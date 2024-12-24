import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player, Task } from '../types/game';
import { HomeAssistantService } from '../services/homeAssistant';
import SocketService from '../services/socketService';
import { saveGameSession } from '../utils/sessionHelpers';

interface GameStore extends GameState {
  haService: HomeAssistantService | null;
  socketService: SocketService;
  setGameCode: (code: string) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayers: (players: Player[]) => void;
  setMaxPlayers: (count: number) => void;
  setPhase: (phase: GameState['phase']) => void;
  reset: () => void;
}

const initialState = {
  gameCode: '',
  players: [],
  maxPlayers: 15,
  phase: 'lobby' as const,
  rooms: [],
  tasks: [],
  haService: null,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      socketService: new SocketService(),

      setGameCode: (code) => {
        const normalizedCode = code.trim().toUpperCase();
        set({ gameCode: normalizedCode });
        saveGameSession({ gameCode: normalizedCode });
      },
      
      addPlayer: (player) => {
        set(state => {
          const existingPlayer = state.players.find(p => p.id === player.id);
          if (existingPlayer) {
            const updatedPlayers = state.players.map(p => 
              p.id === player.id ? { ...p, ...player } : p
            );
            return { players: updatedPlayers };
          }
          return { players: [...state.players, player] };
        });
      },
      
      updatePlayers: (players) => {
        set({ players });
      },
        
      removePlayer: (playerId) => {
        set(state => ({
          players: state.players.filter(p => p.id !== playerId)
        }));
      },
        
      setMaxPlayers: (count) => set({ maxPlayers: count }),
      
      setPhase: (phase) => {
        set({ phase });
        saveGameSession({ phase });
      },
      
      reset: () => {
        const socketService = get().socketService;
        set({ ...initialState, socketService });
      }
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        gameCode: state.gameCode,
        players: state.players,
        phase: state.phase,
        rooms: state.rooms,
        tasks: state.tasks,
        maxPlayers: state.maxPlayers
      })
    }
  )
);