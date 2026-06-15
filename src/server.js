import { createApp } from './app.js';
import { config } from './config/config.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${config.PORT}`);
});

// Resiliencia: cierre ordenado y captura de fallos a nivel de proceso.
const shutdown = (signal) => {
  console.log(`\nRecibida senal ${signal}. Cerrando servidor...`);
  server.close(() => process.exit(0));
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
