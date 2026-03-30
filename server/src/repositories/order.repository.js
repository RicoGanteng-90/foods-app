import Order from '../models/order.model';

export const countOrders = async (filter = {}) => {
  return await Order.countDocuments(filter);
};

export const countUsers = async () => {
  return await User.countDocuments();
};

export const countFoods = async () => {
  return await Food.countDocuments();
};

export const getRevenue = async () => {
  const result = await Order.aggregate([
    { $match: { status: 'Delivered' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  return result[0]?.total || 0;
};

export const findOrders = async (filter, skip, limit) => {
  return await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const findOrdersByUserId = async (userId) => {
  return await Order.find({ user: userId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .lean();
};

export const findOrderById = async (id) => {
  return await Order.findById(id).populate('user', 'name email').lean();
};

export const createOrder = async (orderData, session) => {
  const order = new Order(orderData);
  return await order.save({ session });
};

export const findOrderByIdWithSession = async (id, session) => {
  return await Order.findById(id).session(session);
};
