import Cart from '../models/cart.model.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import Food from '../models/food.model.js';

export const getCartController = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    'items.food',
    'name price image stock'
  );

  if (!cart) {
    return res.status(200).json({ success: true, result: [] });
  }
  res
    .status(200)
    .json({ success: true, message: 'Cart found', result: cart.items });
});

export const addToCartController = asyncHandler(async (req, res) => {
  const food = req.body.food;
  const quantity = parseInt(req.body.quantity, 10);

  if (!food || isNaN(quantity) || quantity < 1) {
    return res
      .status(400)
      .json({ success: false, message: 'Food and quantity are required' });
  }

  const foodItem = await Food.findById(food);

  if (!foodItem) {
    return res
      .status(404)
      .json({ success: false, message: 'Food unavailable' });
  }

  if (quantity > foodItem.stock) {
    return res.status(400).json({
      success: false,
      message: `Only ${foodItem.stock} items available in stock`,
    });
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.food.toString() === food
  );

  if (itemIndex > -1) {
    const newQuantity = cart.items[itemIndex].quantity + quantity;

    if (newQuantity > foodItem.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${quantity} items. Only ${foodItem.stock - cart.items[itemIndex].quantity} more can be added.`,
      });
    }
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    cart.items.push({ food, quantity });
  }

  await cart.save();

  const populatedCart = await cart.populate(
    'items.food',
    'name price image stock'
  );

  res.status(200).json({
    success: true,
    message: 'Cart updated successfully',
    result: populatedCart.items,
  });
});

export const updateCartQuantityController = asyncHandler(async (req, res) => {
  const quantity = parseInt(req.body.quantity, 10);

  if (isNaN(quantity)) {
    return res
      .status(400)
      .json({ success: false, message: 'Quantity required' });
  }

  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const itemIndex = cart.items.findIndex((item) =>
    item.food.equals(req.params.foodId)
  );

  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item  not found' });
  }

  if (quantity < 1) {
    cart.items.splice(itemIndex, 1);
  } else {
    const foodItem = await Food.findById(req.params.foodId).select('stock');

    if (!foodItem) {
      return res
        .status(404)
        .json({ success: false, message: 'food not found' });
    }

    if (quantity > foodItem.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${foodItem.stock} items available in stock`,
      });
    }
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate(
    'items.food',
    'name price image stock'
  );

  res.status(200).json({
    success: true,
    message: 'Cart updated successfully',
    result: populatedCart,
  });
});

export const removeFromCartController = asyncHandler(async (req, res) => {
  const { foodId } = req.params;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.food.toString() === foodId
  );

  if (itemIndex < 0) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  cart.items.splice(itemIndex, 1);

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate(
    'items.food',
    'name price stock image'
  );

  res.status(200).json({
    success: true,
    message: 'Cart item deleted',
    result: populatedCart,
  });
});
