import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer, type Server as HttpServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';

import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { getClientOrigins } from './utils/config';
import { setupSocket } from './socket';

export interface AppHandle {
  app: Express;
  httpServer: HttpServer;
  io: SocketServer;
}

/** Builds the Express app + HTTP server + Socket.IO instance. */
export function createAppHandle(): AppHandle {
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketServer(httpServer, {
    cors: { origin: getClientOrigins(), methods: ['GET', 'POST'] },
  });

  app.use(helmet());
  app.use(
    cors({
      origin: getClientOrigins(),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '200kb' }));
  app.use(express.urlencoded({ extended: false }));

  app.use('/api', routes);
  app.get('/', (_req, res) => res.json({ name: 'Messenger API', docs: '/api/health' }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  setupSocket(io);

  return { app, httpServer, io };
}