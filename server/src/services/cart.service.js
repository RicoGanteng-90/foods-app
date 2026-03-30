import * as cartRepository from '../repositories/cart.repository.js';
import * as foodRepository from '../repositories/food.repository.js';
import Cart from '../models/cart.model.js';

export const getCartService = async (userId) => {
  const cart = await cartRepository.findCartByUserId(userId);

  if (!cart) {
    return { items: [] };
  }

  return { items: cart.items };
};

export const AddToCartService = async (userId, { food, quantity }) => {
  const parsedQuantity = parseInt(quantity, 10);

  if (!food || isNaN(parsedQuantity) || parsedQuantity < 1) {
    throw new AppError('Food and quantity are required', {
      type: 'warn',
      code: 'VALIDATION_ERROR',
    });
  }

  const foodItem = await foodRepository.findFoodById(food);

  if (!foodItem) {
    throw new AppError('Food unavailable', {
      type: 'warn',
      code: 'NOT_FOUND',
    });
  }

  if (parsedQuantity > foodItem.stock) {
    throw new AppError(`Only ${foodItem.stock} items available in stock`, {
      type: 'warn',
      code: 'INSUFFICIENT_STOCK',
    });
  }

  let cart = await cartRepository.findCartByUserId({ userId });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.food.toString() === food
  );

  if (itemIndex > -1) {
    const newQuantity = cart.items[itemIndex].quantity + parsedQuantity;

    if (newQuantity > foodItem.stock) {
      throw new AppError(
        `Cannot add ${parsedQuantity} items. Only ${foodItem.stock - cart.items[itemIndex].quantity} more can be added.`,
        { type: 'warn', code: 'INSUFFICIENT_STOCK' }
      );
    }

    cart.items[itemIndex].quantity = newQuantity;
  } else {
    cart.items.push({ food, quantity: parsedQuantity });
  }

  await cartRepository.saveCart(cart);

  const populatedCart = await cartRepository.findCartByUserId(userId, true);

  return { items: populatedCart.items };
};

export const updateCartService = async (userId, foodId, quantity) => {
  const parsedQuantity = parseInt(quantity, 10);

  if (isNaN(parsedQuantity)) {
    throw new AppError('Quantity required', {
      type: 'warn',
      code: 'VALIDATION_ERROR',
    });
  }

  const cart = await cartRepository.findCartByUserId(userId);

  if (!cart) {
    throw new AppError('Cart not found', {
      type: 'warn',
      code: 'NOT_FOUND',
    });
  }

  const itemIndex = cart.items.findIndex((item) => item.food.equals(foodId));

  if (itemIndex === -1) {
    throw new AppError('Item not found', {
      type: 'warn',
      code: 'NOT_FOUND',
    });
  }

  if (parsedQuantity < 1) {
    cart.items.splice(itemIndex, 1);
  } else {
    const foodItem = await foodRepository.findFoodById(foodId);

    if (!foodItem) {
      throw new AppError('Food not found', {
        type: 'warn',
        code: 'NOT_FOUND',
      });
    }

    if (parsedQuantity > foodItem.stock) {
      throw new AppError(`Only ${foodItem.stock} items available in stock`, {
        type: 'warn',
        code: 'INSUFFICIENT_STOCK',
      });
    }

    cart.items[itemIndex].quantity = parsedQuantity;
  }

  await cartRepository.saveCart(cart);

  const populatedCart = await cartRepository.findCartByUserId(userId, true);

  return { items: populatedCart.items };
};

export const removeFromCartService = async (userId, foodId) => {
  let cart = await cartRepository.findCartByFoodId(userId);

  if (!cart) {
    throw new AppError('Cart not found', {
      type: 'warn',
      code: 'NOT_FOUND',
    });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.food.toString() === foodId
  );

  if (itemIndex < 0) {
    throw new AppError('Item not found', {
      type: 'warn',
      code: 'NOT_FOUND',
    });
  }

  cart.items.splice(itemIndex, 1);

  await cartRepository.saveCart(cart);

  const populatedCart = await cartRepository.findCartByUserId(userId, true);

  return { items: populatedCart.items };
};
