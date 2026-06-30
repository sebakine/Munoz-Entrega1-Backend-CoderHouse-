import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { ProductManager } from './managers/ProductManager.js';
import { registerProductsSocket } from './sockets/productsSocket.js';
import { config } from './config/config.js';

const productManager = new ProductManager();
const app = createApp({ productManager });
const httpServer = createServer(app);
const io = new Server(httpServer);

registerProductsSocket(io, productManager);

httpServer.listen(config.PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${config.PORT}`);
});

// Resiliencia: cierre ordenado y captura de fallos a nivel de proceso.
const shutdown = (signal) => {
  console.log(`\nRecibida senal ${signal}. Cerrando servidor...`);
  io.close();
  httpServer.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  process.exit(1);
});
