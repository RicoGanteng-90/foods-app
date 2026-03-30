import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getFoodByIdService,
  getAllFoodsService,
  updateFoodService,
  createFoodService,
  deleteFoodService,
} from '../services/food.service.js';

export const getAllFoodController = asyncHandler(async (req, res) => {
  const { search, category, page, limit } = req.query;

  const result = await getAllFoodsService({ search, category, page, limit });

  res.status(200).json({
    success: true,
    message: 'Foods fetched successfully',
    ...result,
  });
});

export const getFoodById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { food } = await getFoodByIdService(id);

  res.status(200).json({
    success: true,
    message: 'Food fetched successfully',
    food,
  });
});

export const createFoodController = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  const file = req.file;

  const { result } = await createFoodService(
    {
      name,
      description,
      price,
      category,
      stock,
    },
    file
  );

  res.status(201).json({
    success: true,
    message: 'Foods created successfully',
    result,
  });
});

export const updateFoodController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock } = req.body;

  const file = req.file;

  const { updatedFood } = await updateFoodService(
    id,
    { name, description, price, category, stock },
    file
  );

  res.status(201).json({
    success: true,
    message: 'Food updated successfully',
    updatedFood,
  });
});

export const deleteFoodController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await deleteFoodService(id);

  res.status(200).json({
    success: true,
    message: 'Food and associated image deleted successfully',
    id,
  });
});
