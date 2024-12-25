import { Player } from '../types/game';

interface GameSession {
  gameCode: string | null;
  playerId: string | null;
  player: Player | null;
  phase: string | null;
  isAdmin: boolean;
  wasRemoved?: boolean;
}

class SessionManager {
  private readonly PREFIX = 'amongus_';
  private readonly clientId: string;

  constructor() {
    // Create or retrieve persistent client ID
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
    const session: GameSession = {
      gameCode,
      playerId: player?.id || null,
      player,
      phase: 'lobby',
      isAdmin,
      wasRemoved: false
    };

    console.log('Saving session:', session);
    sessionStorage.setItem(`${this.PREFIX}session`, JSON.stringify(session));
  }

  public getSession(): GameSession {
    const stored = sessionStorage.getItem(`${this.PREFIX}session`);
    if (!stored) {
      return {
        gameCode: null,
        playerId: null,
        player: null,
        phase: null,
        isAdmin: false,
        wasRemoved: false
      };
    }

    return JSON.parse(stored);
  }

  public clearSession(wasRemoved = false): void {
    const session = this.getSession();
    sessionStorage.setItem(`${this.PREFIX}session`, JSON.stringify({
      ...session,
      wasRemoved
    }));
  }

  public wasPlayerRemoved(): boolean {
    return this.getSession().wasRemoved || false;
  }

  public isValidSession(): boolean {
    const session = this.getSession();
    if (session.wasRemoved) return false;
    
    return session.isAdmin ? 
      !!session.gameCode : 
      !!(session.gameCode && session.playerId && session.player);
  }
}

export const sessionManager = new SessionManager();