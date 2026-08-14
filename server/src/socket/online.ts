/**
 * In-process registry of currently connected user sockets.
 * Lives outside socket/index.ts so services/models can query online status
 * without importing the Socket.IO server (avoids circular dependencies).
 */
class OnlineRegistry {
  // userId -> set of connected socket ids (a user may open several tabs).
  private sockets = new Map<number, Set<string>>();

  add(userId: number, socketId: string): void {
    const set = this.sockets.get(userId) ?? new Set<string>();
    set.add(socketId);
    this.sockets.set(userId, set);
  }

  remove(userId: number, socketId: string): boolean {
    const set = this.sockets.get(userId);
    if (!set) return false;
    set.delete(socketId);
    if (set.size === 0) {
      this.sockets.delete(userId);
      return false;
    }
    return true;
  }

  isOnline(userId: number): boolean {
    return this.sockets.has(userId);
  }

  getOnlineIds(): number[] {
    return Array.from(this.sockets.keys());
  }

  getOnlineSet(): Set<number> {
    return new Set(this.getOnlineIds());
  }

  getSize(): number {
    return this.sockets.size;
  }
}

export const onlineRegistry = new OnlineRegistry();