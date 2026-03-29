import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createCategoryService,
  deleteCategoryService,
  getAllCategoriesService,
  updateCategoryService,
} from '../services/category.service.js';

export const getAllCategoriesController = asyncHandler(async (req, res) => {
  const result = await getAllCategoriesService();

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully',
    ...result,
  });
});

export const createCategoryController = asyncHandler(async (req, res) => {
  const result = await createCategoryService(req.body);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    ...result,
  });
});

export const updateCategoryController = asyncHandler(async (req, res) => {
  const result = await updateCategoryService(req.params, req.body);

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    ...result,
  });
});

export const deleteCategoryController = asyncHandler(async (req, res) => {
  const result = await deleteCategoryService(req.params);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    ...result,
  });
});
