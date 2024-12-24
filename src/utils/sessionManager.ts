import { Player } from '../types/game';

export interface GameSession {
  gameCode: string | null;
  playerId: string | null;
  player: Player | null;
  phase: string | null;
  isAdmin: boolean;
}

class SessionManager {
  private static STORAGE_KEYS = {
    GAME_CODE: 'currentGameCode',
    PLAYER_ID: 'currentPlayerId',
    PLAYER: 'currentPlayer',
    PHASE: 'gamePhase',
    ADMIN_GAME: 'adminGameCode',
    PLAYER_REMOVED: 'playerRemoved'
  };

  saveGameSession(gameCode: string, player: Player, isAdmin = false) {
    localStorage.setItem(this.STORAGE_KEYS.GAME_CODE, gameCode);
    localStorage.setItem(this.STORAGE_KEYS.PLAYER_ID, player.id);
    localStorage.setItem(this.STORAGE_KEYS.PLAYER, JSON.stringify(player));
    localStorage.setItem(this.STORAGE_KEYS.PHASE, 'lobby');
    
    if (isAdmin) {
      localStorage.setItem(this.STORAGE_KEYS.ADMIN_GAME, gameCode);
    }
  }

  getSession(): GameSession {
    return {
      gameCode: localStorage.getItem(this.STORAGE_KEYS.GAME_CODE),
      playerId: localStorage.getItem(this.STORAGE_KEYS.PLAYER_ID),
      player: JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PLAYER) || 'null'),
      phase: localStorage.getItem(this.STORAGE_KEYS.PHASE),
      isAdmin: !!localStorage.getItem(this.STORAGE_KEYS.ADMIN_GAME)
    };
  }

  clearSession(wasRemoved = false) {
    if (wasRemoved) {
      localStorage.setItem(this.STORAGE_KEYS.PLAYER_REMOVED, 'true');
    }
    
    Object.values(this.STORAGE_KEYS).forEach(key => {
      if (key !== this.STORAGE_KEYS.PLAYER_REMOVED) {
        localStorage.removeItem(key);
      }
    });
  }

  isValidSession(): boolean {
    const session = this.getSession();
    return !!(session.gameCode && session.playerId && session.player);
  }

  markPlayerRemoved() {
    localStorage.setItem(this.STORAGE_KEYS.PLAYER_REMOVED, 'true');
  }

  wasPlayerRemoved(): boolean {
    return localStorage.getItem(this.STORAGE_KEYS.PLAYER_REMOVED) === 'true';
  }

  clearPlayerRemovedFlag() {
    localStorage.removeItem(this.STORAGE_KEYS.PLAYER_REMOVED);
  }
}

export const sessionManager = new SessionManager();