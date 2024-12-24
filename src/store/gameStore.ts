import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player } from '../types/game';
import { HomeAssistantService } from '../services/homeAssistant';
import SocketService from '../services/socketService';
import { saveGameSession } from '../utils/sessionHelpers';

interface GameStore extends GameState {
  haService: HomeAssistantService | null;
  socketService: SocketService;
  setGameCode: (code: string | null) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayers: (players: Player[]) => void;
  setMaxPlayers: (count: number) => void;
  setPhase: (phase: GameState['phase']) => void;
  reset: () => void;
}

const initialState = {
  gameCode: null,
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
        const normalizedCode = code ? code.trim().toUpperCase() : null;
        set({ gameCode: normalizedCode });
        if (normalizedCode) {
          saveGameSession({ gameCode: normalizedCode });
          localStorage.setItem('adminGameCode', normalizedCode);
        } else {
          localStorage.removeItem('adminGameCode');
        }
      },
      
      addPlayer: (player) => {
        set(state => {
          const existingPlayerIndex = state.players.findIndex(p => p.id === player.id);
          if (existingPlayerIndex !== -1) {
            const updatedPlayers = [...state.players];
            updatedPlayers[existingPlayerIndex] = { ...player };
            return { players: updatedPlayers };
          }
          return { players: [...state.players, player] };
        });
      },
      
      updatePlayers: (players) => {
        const currentPlayer = JSON.parse(localStorage.getItem('currentPlayer') || '{}');
        if (currentPlayer.id && players.some(p => p.id === currentPlayer.id)) {
          set({ players });
        }
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
        maxPlayers: state.maxPlayers
      })
    }
  )
);