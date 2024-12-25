import { Player } from '../types/game';

interface GameSession {
  playerId: string | null;
  player: Player | null;
  isAdmin: boolean;
}

class SessionManager {
  private readonly PREFIX = 'amongus_';
  private readonly clientId: string;

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

  public saveSession(player: Player | null = null, isAdmin = false): void {
    const session: GameSession = {
      playerId: player?.id || null,
      player,
      isAdmin
    };

    console.log('Saving session:', session);
    sessionStorage.setItem(`${this.PREFIX}session`, JSON.stringify(session));
  }

  public getSession(): GameSession {
    const stored = sessionStorage.getItem(`${this.PREFIX}session`);
    if (!stored) {
      return {
        playerId: null,
        player: null,
        isAdmin: false
      };
    }

    return JSON.parse(stored);
  }

  public clearSession(): void {
    sessionStorage.removeItem(`${this.PREFIX}session`);
  }

  public isValidSession(): boolean {
    const session = this.getSession();
    return session.isAdmin || !!(session.playerId && session.player);
  }
}