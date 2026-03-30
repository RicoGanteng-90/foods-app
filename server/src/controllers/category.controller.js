import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createCategoryService,
  deleteCategoryService,
  getAllCategoriesService,
  updateCategoryService,
} from '../services/category.service.js';

export const getAllCategoriesController = asyncHandler(async (req, res) => {
  const { categories } = await getAllCategoriesService();

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully',
    categories,
  });
});

export const createCategoryController = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const { category } = await createCategoryService(name, description);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    category,
  });
});

export const updateCategoryController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const { category } = await updateCategoryService(id, name, description);

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    category,
  });
});

export const deleteCategoryController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await deleteCategoryService(id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    id,
  });
});
