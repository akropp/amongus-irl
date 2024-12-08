import { create } from 'zustand';
import { GameState, Player, Task } from '../types/game';
import { HomeAssistantService } from '../services/homeAssistant';
import SocketService from '../services/socketService';

interface GameStore extends GameState {
  haService: HomeAssistantService | null;
  socketService: SocketService;
  setGameCode: (code: string) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setMaxPlayers: (count: number) => void;
  setPhase: (phase: GameState['phase']) => void;
  updatePlayerTask: (playerId: string, taskId: string, completed: boolean) => void;
  setRooms: (rooms: string[]) => void;
  initializeHomeAssistant: (token: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameCode: '',
  players: [],
  maxPlayers: 15,
  phase: 'lobby',
  rooms: [],
  haService: null,
  socketService: SocketService.getInstance(),

  setGameCode: (code) => {
    const normalizedCode = code.trim().toUpperCase();
    console.log('Setting game code:', normalizedCode);
    set({ gameCode: normalizedCode });
    
    if (normalizedCode) {
      get().socketService.createGame(
        normalizedCode,
        get().maxPlayers,
        get().rooms
      );
    }
  },
  
  addPlayer: (player) => {
    console.log('Adding player:', player);
    get().socketService.joinGame(get().gameCode, player);
    set(state => ({ players: [...state.players, player] }));
  },
    
  removePlayer: (playerId) => {
    set(state => ({
      players: state.players.filter(p => p.id !== playerId)
    }));
  },
    
  setMaxPlayers: (count) => set({ maxPlayers: count }),
  
  setPhase: (phase) => set({ phase }),
  
  updatePlayerTask: (playerId, taskId, completed) => {
    set(state => ({
      players: state.players.map(player =>
        player.id === playerId
          ? {
              ...player,
              tasks: player.tasks.map(task =>
                task.id === taskId ? { ...task, completed } : task
              )
            }
          : player
      )
    }));
  },
    
  setRooms: (rooms) => set({ rooms }),

  initializeHomeAssistant: (token) => {
    try {
      const service = new HomeAssistantService({ token });
      set({ haService: service });
    } catch (error) {
      console.error('Failed to initialize Home Assistant:', error);
    }
  }
}));

// Set up socket listeners
const socketService = SocketService.getInstance();

socketService.onPlayersUpdated((players) => {
  useGameStore.setState({ players });
});

socketService.onGameCreated(({ code }) => {
  console.log('Game created with code:', code);
});