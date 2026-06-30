import { Router } from 'express';
import { ProductManager } from '../managers/ProductManager.js';
import { ProductsController } from '../controllers/products.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createProductsRouter = (productManager) => {
  const router = Router();
  const controller = new ProductsController(productManager ?? new ProductManager());

  router.get('/', asyncHandler(controller.getAll));
  router.get('/:pid', asyncHandler(controller.getById));
  router.post('/', asyncHandler(controller.create));
  router.put('/:pid', asyncHandler(controller.update));
  router.delete('/:pid', asyncHandler(controller.delete));

  return router;
};
