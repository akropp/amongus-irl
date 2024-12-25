import { Player } from '../types/game';

interface GameSession {
  gameCode: string | null;
  playerId: string | null;
  player: Player | null;
  phase: string | null;
  isAdmin: boolean;
}

class SessionManager {
  private readonly PREFIX = 'amongus_';
  private readonly KEYS = {
    CLIENT_ID: 'clientId',
    GAME_CODE: 'gameCode',
    PLAYER_ID: 'playerId',
    PLAYER: 'player',
    PHASE: 'phase',
    IS_ADMIN: 'isAdmin'
  };

  constructor() {
    if (!this.getClientId()) {
      this.setClientId(crypto.randomUUID());
    }
  }

  private key(name: string): string {
    return `${this.PREFIX}${name}`;
  }

  private setClientId(id: string): void {
    sessionStorage.setItem(this.key(this.KEYS.CLIENT_ID), id);
  }

  public getClientId(): string {
    return sessionStorage.getItem(this.key(this.KEYS.CLIENT_ID)) || '';
  }

  public saveSession(gameCode: string, player: Player | null = null, isAdmin = false): void {
    const data = {
      gameCode,
      isAdmin,
      player,
      playerId: player?.id || null,
      phase: 'lobby'
    };

    console.log('💾 Saving session:', data);

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null) {
        localStorage.setItem(
          this.key(key), 
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        );
      }
    });
  }

  public getSession(): GameSession {
    const session = {
      gameCode: localStorage.getItem(this.key(this.KEYS.GAME_CODE)),
      playerId: localStorage.getItem(this.key(this.KEYS.PLAYER_ID)),
      player: JSON.parse(localStorage.getItem(this.key(this.KEYS.PLAYER)) || 'null'),
      phase: localStorage.getItem(this.key(this.KEYS.PHASE)),
      isAdmin: localStorage.getItem(this.key(this.KEYS.IS_ADMIN)) === 'true'
    };

    console.log('📖 Retrieved session:', session);
    return session;
  }

  public clearSession(): void {
    console.log('🗑️ Clearing session');
    Object.values(this.KEYS).forEach(key => {
      if (key !== this.KEYS.CLIENT_ID) {
        localStorage.removeItem(this.key(key));
      }
    });
  }

  public isValidSession(): boolean {
    const session = this.getSession();
    const isValid = session.isAdmin ? 
      !!session.gameCode : 
      !!(session.gameCode && session.playerId && session.player);
    
    console.log('🔍 Session validation:', { isValid, session });
    return isValid;
  }
}

export const sessionManager = new SessionManager();