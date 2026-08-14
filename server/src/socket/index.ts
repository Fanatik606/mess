import type { Server } from 'socket.io';
import { verifyToken } from '../services/auth.service';
import { touchLastSeen } from '../models/user.model';
import { onlineRegistry } from './online';
import { on } from './emitter';

/**
 * Configures the Socket.IO server: authenticates sockets with the JWT,
 * tracks presence and forwards bus events to the right user rooms.
 */
export function setupSocket(io: Server): void {
  // Authenticate every connection.
  io.use((socket, next) => {
    const token = (socket.handshake.auth as { token?: string })?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const { id } = verifyToken(token);
      socket.data.userId = id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as number;

    socket.join(`user:${userId}`);
    const hadConnection = onlineRegistry.isOnline(userId);
    onlineRegistry.add(userId, socket.id);

    // Broadcast presence to other connected users.
    if (!hadConnection) {
      socket.broadcast.emit('user:status', {
        userId,
        status: 'online',
        lastSeen: null,
      });
    }

    socket.on('disconnect', () => {
      const stillConnected = onlineRegistry.remove(userId, socket.id);
      if (!stillConnected) {
        touchLastSeen(userId);
        io.emit('user:status', {
          userId,
          status: 'offline',
          lastSeen: new Date().toISOString(),
        });
      }
    });
  });

  // Forward in-app bus events to subscribed user rooms.
  on('message:new', ({ conversationId, message, recipientIds }) => {
    for (const id of recipientIds) {
      io.to(`user:${id}`).emit('message:new', { conversationId, chatId: conversationId, message });
    }
  });

  on('message:read', ({ conversationId, readerId, recipientIds }) => {
    for (const id of recipientIds) {
      io.to(`user:${id}`).emit('message:read', { conversationId, readerId });
    }
  });

  on('user:status', ({ userId, status, lastSeen }) => {
    io.emit('user:status', { userId, status, lastSeen });
  });
}
