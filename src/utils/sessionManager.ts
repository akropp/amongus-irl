import { Player } from '../types/game';

interface GameSession {
  gameCode: string | null;
  playerId: string | null;
  player: Player | null;
  phase: string | null;
  isAdmin: boolean;
}

class SessionManager {
  private readonly STORAGE_PREFIX = 'amongus_';
  private readonly KEYS = {
    CLIENT_ID: `${this.STORAGE_PREFIX}clientId`,
    GAME_CODE: `${this.STORAGE_PREFIX}gameCode`,
    PLAYER_ID: `${this.STORAGE_PREFIX}playerId`,
    PLAYER: `${this.STORAGE_PREFIX}player`,
    PHASE: `${this.STORAGE_PREFIX}phase`,
    IS_ADMIN: `${this.STORAGE_PREFIX}isAdmin`,
    REMOVED: `${this.STORAGE_PREFIX}removed`
  };

  constructor() {
    // Ensure client ID exists
    if (!this.getClientId()) {
      this.setClientId(this.generateClientId());
    }
  }

  private generateClientId(): string {
    return 'client_' + Math.random().toString(36).substring(2, 15);
  }

  getClientId(): string | null {
    return sessionStorage.getItem(this.KEYS.CLIENT_ID);
  }

  private setClientId(id: string): void {
    sessionStorage.setItem(this.KEYS.CLIENT_ID, id);
  }

  saveGameSession(gameCode: string, player: Player | null, isAdmin = false): void {
    localStorage.setItem(this.KEYS.GAME_CODE, gameCode);
    localStorage.setItem(this.KEYS.IS_ADMIN, String(isAdmin));
    
    if (player) {
      localStorage.setItem(this.KEYS.PLAYER_ID, player.id);
      localStorage.setItem(this.KEYS.PLAYER, JSON.stringify(player));
    }
    
    localStorage.setItem(this.KEYS.PHASE, 'lobby');
    localStorage.removeItem(this.KEYS.REMOVED);
  }

  getSession(): GameSession {
    return {
      gameCode: localStorage.getItem(this.KEYS.GAME_CODE),
      playerId: localStorage.getItem(this.KEYS.PLAYER_ID),
      player: JSON.parse(localStorage.getItem(this.KEYS.PLAYER) || 'null'),
      phase: localStorage.getItem(this.KEYS.PHASE),
      isAdmin: localStorage.getItem(this.KEYS.IS_ADMIN) === 'true'
    };
  }

  clearSession(wasRemoved = false): void {
    if (wasRemoved) {
      localStorage.setItem(this.KEYS.REMOVED, 'true');
    }
    
    Object.values(this.KEYS).forEach(key => {
      if (key !== this.KEYS.CLIENT_ID && key !== this.KEYS.REMOVED) {
        localStorage.removeItem(key);
      }
    });
  }

  isValidSession(): boolean {
    const session = this.getSession();
    return session.isAdmin ? !!session.gameCode : !!(session.gameCode && session.playerId && session.player);
  }

  wasPlayerRemoved(): boolean {
    return localStorage.getItem(this.KEYS.REMOVED) === 'true';
  }

  clearRemovedFlag(): void {
    localStorage.removeItem(this.KEYS.REMOVED);
  }
}

export const sessionManager = new SessionManager();