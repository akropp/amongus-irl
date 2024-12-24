class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 1000 * 60 * 5); // Every 5 minutes
  }

  saveSession(clientId, data) {
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
    return Array.from(this.sessions.values())
      .filter(session => session.gameCode === gameCode);
  }
}

export default new SessionManager();