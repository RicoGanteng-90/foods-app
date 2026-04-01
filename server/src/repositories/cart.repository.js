import Cart from '../models/cart.model.js';

export const findCartByFoodId = async (userId) => {
  return await Cart.findOne({ user: userId });
};

export const findCartById = async (cartId) => {
  return await Cart.findById(cartId);
};

export const findCartByUserId = async (userId, populate = false) => {
  const query = Cart.findOne({ user: userId });
  if (populate) query.populate('item.food', 'name price imageUrl stock');
  return await query;
};

export const saveCart = async (cart) => {
  return await cart.save();
};

export const clearCart = async (cart, session) => {
  cart.items = [];
  return await cart.save({ session });
};
