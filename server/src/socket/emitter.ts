import { EventEmitter } from 'node:events';
import type { Message } from '../models/message.model';

/**
 * A tiny in-process event bus used to push real-time events from the REST
 * layer to the Socket.IO server without them importing each other.
 */
export interface BusEvents {
  'message:new': { conversationId: number; message: Message; recipientIds: number[] };
  'message:read': { conversationId: number; readerId: number; recipientIds: number[] };
  'user:status': { userId: number; status: 'online' | 'offline'; lastSeen: string | null };
}

const bus = new EventEmitter();
bus.setMaxListeners(0);

export function on<K extends keyof BusEvents>(event: K, listener: (payload: BusEvents[K]) => void): void {
  bus.on(event, listener as (...args: unknown[]) => void);
}

export function emit<K extends keyof BusEvents>(event: K, payload: BusEvents[K]): void {
  bus.emit(event, payload);
}