import {
  createOrderController,
  getMyOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatusController,
  cancelOrderController,
  getDahboardStats,
} from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { Router } from 'express';

const router = Router();

//Customer
router.post('/', authenticate, createOrderController);
router.get('/my', authenticate, getMyOrder);

//Admin
router.get('/admin', authenticate, authorize('admin'), getAllOrders);

//detail
router.get('/:id', authenticate, getOrderById);
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  updateOrderStatusController
);
router.patch('/:id/cancel', authenticate, cancelOrderController);

//stats
router.get(
  '/admin/dashboard',
  authenticate,
  authorize('admin'),
  getDahboardStats
);

export default router;
