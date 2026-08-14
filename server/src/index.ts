import { createAppHandle } from './app';
import { port } from './utils/config';
import { getDb } from './database/connection';

const { httpServer, io } = createAppHandle();

// Ensure the SQLite file and schema exist before accepting traffic.
getDb();

httpServer.listen(port, () => {
  console.log(`API + WebSocket server listening on http://localhost:${port}`);
});

function shutdown(signal: string): void {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);
  io.close(() => {
    httpServer.close(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));