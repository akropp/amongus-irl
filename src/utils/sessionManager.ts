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
    this.clientId = this.getOrCreateClientId();
  }

  private getOrCreateClientId(): string {
    const stored = localStorage.getItem(`${this.PREFIX}clientId`);
    if (stored) return stored;
    
    const newId = crypto.randomUUID();
    localStorage.setItem(`${this.PREFIX}clientId`, newId);
    return newId;
  }

  public getClientId(): string {
    return this.clientId;
  }

  public saveSession(gameCode: string, player: Player | null = null, isAdmin = false): void {
    const data: GameSession = {
      gameCode,
      playerId: player?.id || null,
      player,
      phase: 'lobby',
      isAdmin,
      wasRemoved: false
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
        isAdmin: false,
        wasRemoved: false
      };
    }

    const session = JSON.parse(stored);
    console.log('Retrieved session:', session);
    return session;
  }

  public clearSession(wasRemoved = false): void {
    const session = this.getSession();
    const updatedSession: GameSession = {
      ...session,
      wasRemoved
    };
    console.log('Clearing session, wasRemoved:', wasRemoved);
    localStorage.setItem(`${this.PREFIX}session`, JSON.stringify(updatedSession));
  }

  public wasPlayerRemoved(): boolean {
    const session = this.getSession();
    return session.wasRemoved || false;
  }

  public isValidSession(): boolean {
    const session = this.getSession();
    if (session.wasRemoved) return false;
    
    const isValid = session.isAdmin ? 
      !!session.gameCode : 
      !!(session.gameCode && session.playerId && session.player);
    
    console.log('Session validation:', { isValid, session });
    return isValid;
  }
}

export const sessionManager = new SessionManager();