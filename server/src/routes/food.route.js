import {
  getAllFoodController,
  createFoodController,
  updateFoodController,
  deleteFoodController,
  getFoodById,
} from '../controllers/food.controller.js';
import { Router } from 'express';
import upload from '../middleware/multerUpload.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = Router();

router.get('/', getAllFoodController);

router.get('/:id', authenticate, authorize('admin'), getFoodById);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  upload.single('image'),
  createFoodController
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  upload.single('image'),
  updateFoodController
);

router.delete('/:id', authenticate, deleteFoodController);

export default router;
