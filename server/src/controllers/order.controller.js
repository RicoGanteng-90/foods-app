import { asyncHandler } from '../middleware/asyncHandler.js';
import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import Food from '../models/food.model.js';

export const getDahboardStats = asyncHandler(async (req, res) => {
  const [totalOrders, totalUsers, totalFoods] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments(),
    Food.countDocuments(),
  ]);

  const revenue = await Order.aggregate([
    { $match: { status: 'Delivered' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  const [pending, confirmed, cooking, delivered, cancelled] = await Promise.all(
    [
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Confirmed' }),
      Order.countDocuments({ status: 'Cooking' }),
      Order.countDocuments({ status: 'Delivered' }),
      Order.countDocuments({ status: 'Cancelled' }),
    ]
  );

  res.json({
    totalOrders,
    totalUsers,
    totalFoods,
    revenue: revenue[0]?.total || 0,
    pending,
    confirmed,
    cooking,
    delivered,
    cancelled,
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const status = req.query.status || '';
  const search = req.query.search || '';

  let query = {};

  if (status && status !== 'All') {
    query.status = status;
  }

  if (search) {
    query.orderNumber = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const totalOrders = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('orderItems.food', 'name image price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    message: 'All orders fetched succesfully',
    page,
    totalPages: Math.ceil(totalOrders / limit) || 1,
    totalOrders,
    result: orders,
  });
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('user', 'name email')
    .populate('orderItems.food', 'name image price');

  if (!orders || orders.length === 0) {
    return res.status(200).json({
      success: true,
      message: `You don't have any order history`,
      result: [],
    });
  }

  res.status(200).json({
    success: true,
    message: 'Orders found',
    result: orders,
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems', 'name, image');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const isOwner = order.user._id.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  res.status(200).json({ success: true, result: order });
});

export const createOrderController = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod, orderNote } = req.body;

  if (!deliveryAddress || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: 'Delivery address and payment method are required',
    });
  }

  const cart = await Cart.findOne({ user: req.user.id }).populate(
    'items.food',
    'name price imageUrl stock'
  );

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty',
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of cart.items) {
      const updated = await Food.findOneAndUpdate(
        { _id: item.food._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      );

      if (!updated) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `${item.food.name} is out of stock or has insufficient quantity`,
        });
      }
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.food.price * item.quantity,
      0
    );

    const orderItems = cart.items.map((item) => ({
      food: item.food._id,
      name: item.food.name,
      price: item.food.price,
      image: item.food.imageUrl,
      quantity: item.quantity,
    }));

    const generateOrderNumber = () => {
      return `ORD-${Date.now()}-${Math.floor(Math.random() * 9000)}`;
    };

    const order = new Order({
      orderNumber: generateOrderNumber(),
      user: req.user.id,
      orderItems,
      orderNote,
      deliveryAddress,
      total,
      paymentMethod,
    });

    await order.save({ session });

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Order created succesfully',
      result: order,
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

export const updateOrderStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    'Pending',
    'Confirmed',
    'Cooking',
    'Delivered',
    'Cancelled',
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Valid statuses are ${validStatuses.join(', ')}`,
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'Cancelled') {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: 'Order already cancelled' });
    }

    if (status === 'Cancelled') {
      for (const item of order.orderItems) {
        await Food.findOneAndUpdate(
          { _id: item.food._id },
          { $inc: { stock: +item.quantity } },
          { session }
        );
      }
    }

    order.status = status;
    await order.save({ session });

    await session.commitTransaction();

    const result = await Order.findById(id).populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      result: result,
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
});

export const cancelOrderController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const isAdmin = req.user.role === 'admin';
  const isOwner = order.user.toString() === req.user.id;

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  if (!isAdmin && order.status !== 'Pending') {
    return res.status(400).json({
      success: false,
      message: `Order cannot be cancelled at status: ${order.status}`,
    });
  }

  if (order.status === 'Cancelled') {
    return res
      .status(400)
      .json({ success: false, message: 'Order is already cancelled' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of order.orderItems) {
      await Food.findOneAndUpdate(
        { _id: item.food._id },
        { $inc: { stock: +item.quantity } },
        { session }
      );
    }

    order.status = 'Cancelled';
    await order.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      result: order,
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
});
