import { Player } from '../types/game';

export interface GameSession {
  gameCode: string | null;
  playerId: string | null;
  player: Player | null;
  phase: string | null;
}

export function getGameSession(): GameSession {
  return {
    gameCode: localStorage.getItem('currentGameCode'),
    playerId: localStorage.getItem('currentPlayerId'),
    player: JSON.parse(localStorage.getItem('currentPlayer') || 'null'),
    phase: localStorage.getItem('gamePhase')
  };
}

export function clearGameSession() {
  localStorage.removeItem('currentGameCode');
  localStorage.removeItem('currentPlayerId');
  localStorage.removeItem('currentPlayer');
  localStorage.removeItem('gamePhase');
}

export function isValidGameSession(session: GameSession, currentPlayers: Player[]): boolean {
  if (!session.gameCode || !session.playerId || !session.player) {
    return false;
  }

  // Verify the player exists in the current game
  return currentPlayers.some(p => p.id === session.playerId);
}