import { Router } from 'express';
import { ProductManager } from '../managers/ProductManager.js';
import { ProductsController } from '../controllers/products.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const controller = new ProductsController(new ProductManager());

router.get('/', asyncHandler(controller.getAll));
router.get('/:pid', asyncHandler(controller.getById));
router.post('/', asyncHandler(controller.create));
router.put('/:pid', asyncHandler(controller.update));
router.delete('/:pid', asyncHandler(controller.delete));

export default router;
