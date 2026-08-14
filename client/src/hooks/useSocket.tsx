import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { WS_URL } from '../utils/constants';
import { useAuth } from './useAuth';
import type { Message } from '../types';

/** Payload shapes pushed by the Socket.IO server. */
export interface SocketMessageEvent {
  conversationId: number;
  chatId: number;
  message: Message;
}
export interface SocketReadEvent {
  conversationId: number;
  readerId: number;
}
export interface SocketStatusEvent {
  userId: number;
  status: 'online' | 'offline';
  lastSeen: string | null;
}

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

/**
 * Keeps a single authenticated Socket.IO connection alive while the user is
 * logged in. Reconnects automatically and closes on logout.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      return;
    }

    const instance: Socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    instance.on('connect', () => setConnected(true));
    instance.on('disconnect', () => setConnected(false));
    instance.on('connect_error', () => setConnected(false));

    socketRef.current = instance;
    setSocket(instance);

    return () => {
      instance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [token]);

  const value = useMemo<SocketContextValue>(() => ({ socket, connected }), [socket, connected]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
