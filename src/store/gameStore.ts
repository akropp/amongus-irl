import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player, Task } from '../types/game';
import { HomeAssistantService } from '../services/homeAssistant';
import SocketService from '../services/socketService';

interface GameStore extends GameState {
  haService: HomeAssistantService | null;
  socketService: SocketService;
  setGameCode: (code: string) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayers: (players: Player[]) => void;
  setMaxPlayers: (count: number) => void;
  setPhase: (phase: GameState['phase']) => void;
  updatePlayerTask: (playerId: string, taskId: string, completed: boolean) => void;
  setRooms: (rooms: string[]) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  assignRoles: () => void;
  assignTasks: () => void;
  initializeHomeAssistant: (token: string) => void;
  startGame: () => void;
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
        localStorage.setItem('currentGameCode', normalizedCode);
        
        if (normalizedCode) {
          get().socketService.createGame(
            normalizedCode,
            get().maxPlayers,
            get().rooms
          );
        }
      },
      
      addPlayer: (player) => {
        set(state => ({
          players: state.players.find(p => p.id === player.id)
            ? state.players.map(p => p.id === player.id ? { ...p, ...player } : p)
            : [...state.players, player]
        }));
      },
      
      updatePlayers: (players) => {
        set({ players });
      },
        
      removePlayer: (playerId) => {
        set(state => ({
          players: state.players.filter(p => p.id !== playerId)
        }));
        // If current player is removed, clear local storage
        const currentPlayerId = localStorage.getItem('currentPlayerId');
        if (currentPlayerId === playerId) {
          localStorage.removeItem('currentGameCode');
          localStorage.removeItem('currentPlayerId');
          localStorage.removeItem('currentPlayer');
        }
      },
        
      setMaxPlayers: (count) => set({ maxPlayers: count }),
      
      setPhase: (phase) => {
        set({ phase });
        // Update local storage with game phase
        localStorage.setItem('gamePhase', phase);
      },
      
      // ... rest of the store implementation remains the same ...

      reset: () => {
        const socketService = get().socketService;
        set({ ...initialState, socketService });
        localStorage.removeItem('currentGameCode');
        localStorage.removeItem('currentPlayerId');
        localStorage.removeItem('currentPlayer');
        localStorage.removeItem('gamePhase');
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