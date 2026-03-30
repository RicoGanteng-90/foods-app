import { asyncHandler } from '../middleware/asyncHandler.js';
import Order from '../models/order.model.js';
import mongoose from 'mongoose';
import Food from '../models/food.model.js';
import {
  cancelOrderService,
  createOrderService,
  getAllOrdersService,
  getDashboardStatsService,
  getMyOrderService,
  updateOrderStatusService,
} from '../services/order.service.js';

export const getDahboardStats = asyncHandler(async (req, res) => {
  const stats = await getDashboardStatsService();

  res.status(200).json({
    success: true,
    message: 'Dashboard stats fetched successfully',
    ...stats,
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.query;

  const result = await getAllOrdersService({ page, limit, status, search });

  res.status(200).json({
    success: true,
    message: 'All orders fetched succesfully',
    ...result,
  });
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;

  const { orders, message } = await getMyOrderService(userId);

  res.status(200).json({
    success: true,
    message,
    orders,
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id: orderId } = req.params;
  const { id: userId, role } = req.user;

  const { order } = await getMyOrderService(orderId, { userId, role });

  res.status(200).json({ success: true, order });
});

export const createOrderController = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod, orderNote } = req.body;
  const { id: userId } = req.user;

  const { order } = await createOrderService(userId, {
    deliveryAddress,
    paymentMethod,
    orderNote,
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order,
  });
});

export const updateOrderStatusController = asyncHandler(async (req, res) => {
  const { id: orderId } = req.params;
  const { status } = req.body;

  const { order } = await updateOrderStatusService(orderId, status);

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    order,
  });
});

export const cancelOrderController = asyncHandler(async (req, res) => {
  const { id: orderId } = req.params;
  const { id: userId, role } = req.user;

  const { order } = await cancelOrderService(orderId, { userId, role });

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    order,
  });
});
