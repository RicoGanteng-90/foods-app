import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getFoodByIdService,
  getAllFoodsService,
  updateFoodService,
  createFoodService,
  deleteFoodService,
} from '../services/food.service.js';

export const getAllFoodController = asyncHandler(async (req, res) => {
  const result = await getAllFoodsService(req.query);

  res.status(200).json({
    success: true,
    message: 'Foods fetched successfully',
    ...result,
  });
});

export const getFoodById = asyncHandler(async (req, res) => {
  const result = await getFoodByIdService(req.params);

  res.status(200).json({
    success: true,
    message: 'Food fetched successfully',
    ...result,
  });
});

export const createFoodController = asyncHandler(async (req, res) => {
  const result = await createFoodService(req.body, req.file);

  res.status(201).json({
    success: true,
    message: 'Foods created successfully',
    ...result,
  });
});

export const updateFoodController = asyncHandler(async (req, res) => {
  const result = await updateFoodService(req.params, req.body, req.file);

  res.status(201).json({
    success: true,
    message: 'Food updated successfully',
    ...result,
  });
});

export const deleteFoodController = asyncHandler(async (req, res, next) => {
  const result = await deleteFoodService(req.params);

  res.status(200).json({
    success: true,
    message: 'Food and associated image deleted successfully',
    ...result,
  });
});
