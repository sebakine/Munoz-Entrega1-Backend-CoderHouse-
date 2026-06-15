import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import { sendSuccess } from './utils/httpResponse.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/errorHandler.js';

// Construccion de la aplicacion Express (sin escuchar el puerto) para
// facilitar el testeo aislado de la capa de transporte.
export const createApp = () => {
  const app = express();

  app.use(express.json());

  app.get('/api/health', (req, res) => sendSuccess(res, 200, { status: 'up' }));

  app.use('/api/products', productsRouter);
  app.use('/api/carts', cartsRouter);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
