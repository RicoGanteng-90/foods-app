import { Router } from 'express';
import {
  addToCartController,
  getCartController,
  removeFromCartController,
  updateCartQuantityController,
} from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, getCartController);
router.post('/', authenticate, addToCartController);
router.patch('/:foodId', authenticate, updateCartQuantityController);
router.delete('/:foodId', authenticate, removeFromCartController);

export default router;
