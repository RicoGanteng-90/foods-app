import * as orderRepository from '../repositories/order.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import * as foodRepository from '../repositories/food.repository.js';
import * as cartRepository from '../repositories/cart.repository.js';

export const getDashboardStatsService = async () => {
  const [
    totalOrders,
    totalUsers,
    totalFoods,
    revenue,
    pending,
    confirmed,
    cooking,
    delivered,
    cancelled,
  ] = await Promise.all([
    orderRepository.countOrders(),
    userRepository.countUsers(),
    foodRepository.countFoods(),
    orderRepository.getRevenue(),
    orderRepository.countOrders({ status: 'Pending' }),
    orderRepository.countOrders({ status: 'Confirmed' }),
    orderRepository.countOrders({ status: 'Cooking' }),
    orderRepository.countOrders({ status: 'Delivered' }),
    orderRepository.countOrders({ status: 'Cancelled' }),
  ]);

  return {
    totalOrders,
    totalUsers,
    totalFoods,
    revenue,
    orderStatus: {
      pending,
      confirmed,
      cooking,
      delivered,
      cancelled,
    },
  };
};

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getAllOrdersService = async ({ page, limit, status, search }) => {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(Math.max(1, parseInt(limit) || 10), 50);

  let filter = {};

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (search) {
    filter.orderNumber = { $regex: escapeRegex(search), $options: 'i' };
  }

  const skip = (parsedPage - 1) * parsedLimit;

  const [orders, totalOrders] = await Promise.all([
    orderRepository.findOrders(filter, skip, parsedLimit),
    orderRepository.countOrders(filter),
  ]);

  return {
    orders,
    page: parsedPage,
    totaPages: Math.ceil(totalOrders / parsedLimit) || 1,
    totalOrders,
  };
};

export const getMyOrderService = async (userId) => {
  const orders = await orderRepository.findOrdersByUserId(userId);

  if (!orders || orders.length === 0) {
    return { orders: [], message: "You don't have any order history" };
  }

  return { orders, message: 'Orders found' };
};

export const getOrderByIdService = async (orderId, { userId, role }) => {
  const order = await orderRepository.findOrderById(orderId);

  if (!order) {
    throw new AppError('Order not found', {
      type: 'warn',
      code: 'NOT_FOUND',
    });
  }

  const isOwner = order.user._id.toString() === userId;
  const isAdmin = role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('Unauthorized', {
      type: 'warn',
      code: 'FORBIDDEN',
    });
  }

  return { order };
};

const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 9000)}`;
};

export const createOrderService = async (
  userId,
  { deliveryAddress, paymentMethod, orderNote }
) => {
  if (!deliveryAddress || !paymentMethod) {
    throw new AppError('Delivery address and payment method are required', {
      type: 'warn',
      code: 'VALIDATION_ERROR',
    });
  }

  const cart = await cartRepository.findCartByUserId(userId, true);

  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', {
      type: 'warn',
      code: 'VALIDATION_ERROR',
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of cart.items) {
      const updated = await foodRepository.decrementStock(
        item.food._id,
        item.quantity,
        session
      );

      if (!updated) {
        await session.abortTransaction();
        throw new AppError(
          `${item.food.name} is out of stock or has insufficient quantity`,
          { type: 'warn', code: 'INSUFFICIENT_STOCK' }
        );
      }
    }

    const orderItems = cart.items.map((item) => ({
      food: item.food._id,
      name: item.food.name,
      price: item.food.price,
      image: item.food.imageUrl,
      quantity: item.quantity,
    }));

    const total = cart.items.reduce(
      (sum, item) => sum + item.food.price * item.quantity,
      0
    );

    const order = await orderRepository.createOrder({
      orderNumber: generateOrderNumber(),
      user: userId,
      orderItems,
      orderNote,
      deliveryAddress,
      total,
      paymentMethod,
    });

    await cartRepository.clearCart(cart, session);

    await session.commitTransaction();

    return { order };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const updateOrderStatusService = async (orderId, status) => {
  const validStatuses = [
    'Pending',
    'Confirmed',
    'Cooking',
    'Delivered',
    'Cancelled',
  ];

  if (!validStatuses.includes(status)) {
    throw new AppError(
      `Invalid status. Valid statuses are ${validStatuses.join(', ')}`,
      {
        type: 'warn',
        code: 'VALIDATION_ERROR',
      }
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await orderRepository.findOrderByIdWithSession(
      orderId,
      session
    );

    if (!order) {
      await session.abortTransaction();
      throw new AppError('Order not found', {
        type: 'warn',
        code: 'NOT_FOUND',
      });
    }

    if (order.status === 'Cancelled') {
      await session.abortTransaction();
      throw new AppError('Order already cancelled', {
        type: 'warn',
        code: 'INVALID_STATUS',
      });
    }

    if (status === 'Cancelled') {
      for (const item of order.orderItems) {
        await foodRepository.incrementStock(item.food, item.quantity, session);
      }
    }

    order.status = status;
    await order.save({ session });

    await session.commitTransaction();

    const updatedOrder = await orderRepository.findOrderById(orderId);

    return { order: updatedOrder };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
};

export const cancelOrderService = async (orderId, { userId, role }) => {
  const order = await orderRepository.findOrderById(orderId);

  if (!order) {
    throw new AppError('Order not found', {
      type: 'warn',
      code: 'NOT_FOUND',
    });
  }

  const isAdmin = req.user.role === 'admin';
  const isOwner = order.user.toString() === userId;

  if (!isOwner && !isAdmin) {
    throw new AppError('Unauthorized', {
      type: 'warn',
      code: 'FORBIDDEN',
    });
  }

  if (order.status === 'Cancelled') {
    throw new AppError('Order is already cancelled', {
      type: 'warn',
      code: 'INVALID_STATUS',
    });
  }

  if (!isAdmin && order.status !== 'Pending') {
    throw new AppError(`Order cannot be cancelled at status: ${order.status}`, {
      type: 'warn',
      code: 'INVALID_STATUS',
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of order.orderItems) {
      await foodRepository.incrementStock(item.food, item.quantity, session);
    }

    order.status = 'Cancelled';
    await order.save({ session });

    await session.commitTransaction();

    return { order };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
};
