import express from 'express';
import { engine } from 'express-handlebars';
import { ProductManager } from './managers/ProductManager.js';
import { createProductsRouter } from './routes/products.router.js';
import { createViewsRouter } from './routes/views.router.js';
import cartsRouter from './routes/carts.router.js';
import { sendSuccess } from './utils/httpResponse.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/errorHandler.js';
import { config } from './config/config.js';

// Construccion de la aplicacion Express (sin escuchar el puerto) para
// facilitar el testeo aislado de la capa de transporte.
export const createApp = ({ productManager } = {}) => {
  const manager = productManager ?? new ProductManager();
  const app = express();

  app.engine('handlebars', engine({ defaultLayout: 'main' }));
  app.set('view engine', 'handlebars');
  app.set('views', config.VIEWS_DIR);

  app.use(express.json());
  app.use(express.static(config.PUBLIC_DIR));

  app.get('/api/health', (req, res) => sendSuccess(res, 200, { status: 'up' }));

  app.use('/', createViewsRouter(manager));
  app.use('/api/products', createProductsRouter(manager));
  app.use('/api/carts', cartsRouter);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
