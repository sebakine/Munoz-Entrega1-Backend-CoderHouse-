import { Router } from 'express';
import { CartManager } from '../managers/CartManager.js';
import { ProductManager } from '../managers/ProductManager.js';
import { CartsController } from '../controllers/carts.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const controller = new CartsController(new CartManager(new ProductManager()));

router.post('/', asyncHandler(controller.create));
router.get('/:cid', asyncHandler(controller.getProducts));
router.post('/:cid/product/:pid', asyncHandler(controller.addProduct));

export default router;
