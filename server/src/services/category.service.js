import * as categoryRepository from '../repositories/category.repository.js';
import * as foodRepository from '../repositories/food.repository.js';
import AppError from '../utils/AppError.js';

export const getAllCategoriesService = async () => {
  const categories = await categoryRepository.findCategories();

  return { categories };
};

export const createCategoryService = async (body) => {
  const { name, description } = body;

  if (!name) {
    throw new AppError('Category name required', {
      type: 'warn',
      code: 'VALIDATION_ERROR',
      caution: 'Please fill category name',
    });
  }

  const category = await categoryRepository.createCategory({
    name,
    description,
  });

  if (!category) {
    throw new AppError('Failed to save data', {
      type: 'error',
      code: 'DATABASE_SAVE_FAILED',
    });
  }

  return { category };
};

export const updateCategoryService = async (params, body) => {
  const { id } = params;
  const { name, description } = body;

  if (!name) {
    throw new AppError('Category name required', {
      type: 'warn',
      code: 'VALIDATION_ERROR',
      caution: 'Please fill category name',
    });
  }

  const category = await categoryRepository.updateCategoryById(id, {
    name,
    description,
  });

  if (!category) {
    throw new AppError('Failed to save data', {
      type: 'error',
      code: 'DATABASE_SAVE_FAILED',
    });
  }

  return { category };
};

export const deleteCategoryService = async (params) => {
  const { id } = params;

  const isUsed = await foodRepository.exists({
    category: id,
  });

  if (isUsed) {
    throw new AppError('Cannot delete category', {
      type: 'warn',
      caution: 'This category is still being used by some food items',
      code: 'CATEGORY_IN_USE',
    });
  }

  const category = await categoryRepository.deleteCategoryById(id);

  if (!category) {
    throw new AppError('Category not found', {
      type: 'error',
      code: 'NOT_FOUND',
    });
  }

  return { id };
};
