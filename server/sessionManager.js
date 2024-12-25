class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 1000 * 60 * 5);
  }

  saveSession(clientId, data) {
    console.log('Saving session:', { clientId, data });
    this.sessions.set(clientId, {
      ...data,
      lastActive: Date.now()
    });
  }

  getSession(clientId) {
    const session = this.sessions.get(clientId);
    if (session) {
      session.lastActive = Date.now();
      this.sessions.set(clientId, session);
    }
    return session;
  }

  removeSession(clientId) {
    this.sessions.delete(clientId);
  }

  cleanup() {
    const now = Date.now();
    const timeout = 1000 * 60 * 30; // 30 minutes
    
    for (const [clientId, session] of this.sessions.entries()) {
      if (now - session.lastActive > timeout) {
        this.sessions.delete(clientId);
      }
    }
  }

  getGameSessions(gameCode) {
    return Array.from(this.sessions.entries())
      .filter(([_, session]) => session.gameCode === gameCode)
      .map(([clientId, session]) => ({ clientId, ...session }));
  }

  isPlayerInGame(gameCode, playerId) {
    return Array.from(this.sessions.values())
      .some(session => session.gameCode === gameCode && session.playerId === playerId);
  }
}

export default new SessionManager();