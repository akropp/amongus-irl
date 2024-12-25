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
  private clientId: string;

  constructor() {
    this.clientId = this.getOrCreateClientId();
  }

  private getOrCreateClientId(): string {
    const stored = sessionStorage.getItem(`${this.PREFIX}clientId`);
    if (stored) return stored;
    
    const newId = crypto.randomUUID();
    sessionStorage.setItem(`${this.PREFIX}clientId`, newId);
    return newId;
  }

  public getClientId(): string {
    return this.clientId;
  }

  public saveSession(gameCode: string, player: Player | null = null, isAdmin = false): void {
    const data = {
      gameCode,
      playerId: player?.id || null,
      player,
      phase: 'lobby',
      isAdmin,
      timestamp: Date.now()
    };

    console.log('Saving session:', data);
    localStorage.setItem(`${this.PREFIX}session`, JSON.stringify(data));
  }

  public getSession(): GameSession {
    const stored = localStorage.getItem(`${this.PREFIX}session`);
    if (!stored) {
      return {
        gameCode: null,
        playerId: null,
        player: null,
        phase: null,
        isAdmin: false
      };
    }

    const session = JSON.parse(stored);
    console.log('Retrieved session:', session);
    return session;
  }

  public clearSession(): void {
    console.log('Clearing session');
    localStorage.removeItem(`${this.PREFIX}session`);
  }

  public isValidSession(): boolean {
    const session = this.getSession();
    const isValid = session.isAdmin ? 
      !!session.gameCode : 
      !!(session.gameCode && session.playerId && session.player);
    
    console.log('Session validation:', { isValid, session });
    return isValid;
  }
}

export const sessionManager = new SessionManager();