export interface Player {
  id: string;
  name: string;
  role: 'crewmate' | 'impostor' | 'unassigned';
  isAlive: boolean;
  tasks: Task[];
}

export interface Task {
  id: string;
  description: string;
  room: string;
  completed: boolean;
}

export interface Sabotage {
  id: string;
  name: string;
  room: string;
  duration: number;
  active: boolean;
}

export interface GameState {
  gameCode: string;
  players: Player[];
  maxPlayers: number;
  phase: 'lobby' | 'playing' | 'meeting' | 'ended';
  rooms: string[];
  tasks: Task[];
  sabotages: Sabotage[];
}