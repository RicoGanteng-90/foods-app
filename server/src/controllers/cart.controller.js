import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  AddToCartService,
  getCartService,
  removeFromCartService,
  updateCartService,
} from '../services/cart.service.js';

export const getCartController = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;

  const { items } = await getCartService(userId);

  res.status(200).json({ success: true, message: 'Cart found', items });
});

export const addToCartController = asyncHandler(async (req, res) => {
  const { food, quantity } = req.body;
  const { id: userId } = req.user;

  const { items } = await AddToCartService(userId, { food, quantity });

  res.status(200).json({
    success: true,
    message: 'Cart updated successfully',
    items,
  });
});

export const updateCartQuantityController = asyncHandler(async (req, res) => {
  const { foodId } = req.params;
  const { quantity } = req.body;
  const { id: userId } = req.user;

  const { items } = await updateCartService(userId, foodId, quantity);

  res.status(200).json({
    success: true,
    message: 'Cart updated successfully',
    items,
  });
});

export const removeFromCartController = asyncHandler(async (req, res) => {
  const { foodId } = req.params;
  const { id: userId } = req.user;

  const { items } = await removeFromCartService(userId, foodId);

  res.status(200).json({
    success: true,
    message: 'Cart item deleted',
    items,
  });
});
