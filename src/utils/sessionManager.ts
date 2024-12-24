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
  private readonly STORAGE_KEYS = {
    CLIENT_ID: `${this.STORAGE_PREFIX}clientId`,
    GAME_CODE: `${this.STORAGE_PREFIX}gameCode`,
    PLAYER_ID: `${this.STORAGE_PREFIX}playerId`,
    PLAYER: `${this.STORAGE_PREFIX}player`,
    PHASE: `${this.STORAGE_PREFIX}phase`,
    IS_ADMIN: `${this.STORAGE_PREFIX}isAdmin`,
    REMOVED: `${this.STORAGE_PREFIX}removed`,
    LAST_PAGE: `${this.STORAGE_PREFIX}lastPage`
  };

  constructor() {
    if (!this.getClientId()) {
      this.setClientId(crypto.randomUUID());
    }
  }

  getClientId(): string {
    return sessionStorage.getItem(this.STORAGE_KEYS.CLIENT_ID) || '';
  }

  private setClientId(id: string): void {
    sessionStorage.setItem(this.STORAGE_KEYS.CLIENT_ID, id);
  }

  saveSession(gameCode: string, player: Player | null, isAdmin = false, page?: string): void {
    localStorage.setItem(this.STORAGE_KEYS.GAME_CODE, gameCode);
    localStorage.setItem(this.STORAGE_KEYS.IS_ADMIN, String(isAdmin));
    
    if (player) {
      localStorage.setItem(this.STORAGE_KEYS.PLAYER_ID, player.id);
      localStorage.setItem(this.STORAGE_KEYS.PLAYER, JSON.stringify(player));
    }
    
    localStorage.setItem(this.STORAGE_KEYS.PHASE, 'lobby');
    if (page) {
      localStorage.setItem(this.STORAGE_KEYS.LAST_PAGE, page);
    }
    localStorage.removeItem(this.STORAGE_KEYS.REMOVED);
  }

  getSession(): GameSession & { lastPage: string | null } {
    return {
      gameCode: localStorage.getItem(this.STORAGE_KEYS.GAME_CODE),
      playerId: localStorage.getItem(this.STORAGE_KEYS.PLAYER_ID),
      player: JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PLAYER) || 'null'),
      phase: localStorage.getItem(this.STORAGE_KEYS.PHASE),
      isAdmin: localStorage.getItem(this.STORAGE_KEYS.IS_ADMIN) === 'true',
      lastPage: localStorage.getItem(this.STORAGE_KEYS.LAST_PAGE)
    };
  }

  clearSession(wasRemoved = false): void {
    if (wasRemoved) {
      localStorage.setItem(this.STORAGE_KEYS.REMOVED, 'true');
    }
    
    Object.values(this.STORAGE_KEYS).forEach(key => {
      if (key !== this.STORAGE_KEYS.CLIENT_ID) {
        localStorage.removeItem(key);
      }
    });
  }

  isValid(): boolean {
    const session = this.getSession();
    return session.isAdmin ? !!session.gameCode : !!(session.gameCode && session.playerId && session.player);
  }

  wasPlayerRemoved(): boolean {
    return localStorage.getItem(this.STORAGE_KEYS.REMOVED) === 'true';
  }
}

export const sessionManager = new SessionManager();