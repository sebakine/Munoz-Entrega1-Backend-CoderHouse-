import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createViewsRouter = (productManager) => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const products = await productManager.getAll();
      res.render('home', { title: 'Productos', products });
    })
  );

  router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en tiempo real', realtime: true });
  });

  return router;
};
