import * as foodRepository from '../repositories/food.repository.js';
import * as categoryRepository from '../repositories/category.repository.js';
import AppError from '../utils/AppError.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';

export const getAllFoodsService = async (query) => {
  const { search, category, page = 1, limit = 10 } = query;

  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  if (category) {
    filter.category = category;
  }

  const skip = (page - 1) * limit;

  const [foods, total] = await Promise.all([
    foodRepository.findFoods(filter, skip, Number(limit)),
    foodRepository.countFoods(filter),
  ]);

  return {
    foods,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

export const getFoodByIdService = async (params) => {
  const { id } = params;

  const food = await foodRepository.findFoodById(id);

  if (!food)
    throw new AppError('Food not found', {
      type: 'warn',
      code: 'FOOD_NOT_FOUND',
      caution: 'No food exists with that ID',
      context: {
        attemptId: id,
      },
    });

  return { food };
};

export const createFoodService = async (body, file) => {
  const { name, description, price, category, stock } = body;

  if (
    !name ||
    name.trim() === '' ||
    description === undefined ||
    price === undefined ||
    price === null ||
    !category ||
    stock === undefined ||
    stock === null
  ) {
    throw new AppError('All field required', {
      type: 'warn',
      code: 'VALIDATION_ERROR',
      caution:
        'Please ensure name, description, price, category, and stock are filled',
    });
  }

  if (
    typeof price !== 'number' ||
    price < 0 ||
    typeof stock !== 'number' ||
    stock < 0
  ) {
    throw new AppError('Type and ammount error', {
      type: 'warn',
      code: 'VALIDATION_ERROR',
      caution: 'Price and stock must be valid positive numbers',
    });
  }

  const existingName = await foodRepository.findFoodByQuery({ name: name });

  if (existingName) {
    throw new AppError('Record exist', {
      type: 'warn',
      code: 'DUPLICATE_RECORD',
      caution: 'Food already exist',
    });
  }

  const categoryId = await categoryRepository.findCategoryById(category);

  if (!categoryId) {
    throw new AppError('Category not found', {
      type: 'warn',
      code: 'CATEGORY_NOT_FOUND',
      caution: 'No category exist with that ID',
      context: {
        attemptId: category,
        collection: 'category',
      },
    });
  }

  let imageUrl = null;
  let imagePublicId = null;

  if (file) {
    try {
      const uploadResult = await uploadToCloudinary(file.buffer);

      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    } catch (err) {
      throw new AppError('Failed to upload image to Cloudinary', {
        type: 'error',
        code: 'IMAGE_UPLOAD_ERROR',
        caution: err.message,
      });
    }
  }

  try {
    const result = await foodRepository.createFood({
      name,
      description,
      price,
      category,
      stock,
      imageUrl,
      imagePublicId,
    });

    return { result };
  } catch (err) {
    if (imagePublicId) {
      await deleteFromCloudinary(imagePublicId);
    }
    throw new AppError('Failed to save data', {
      type: 'error',
      code: 'DATABASE_SAVE_FAILED',
      caution: err.message,
    });
  }
};

export const updateFoodService = async (params, body, file) => {
  const { id } = params;
  const { name, description, price, category, stock } = body;

  const food = await foodRepository.findFoodById(id);
  if (!food) {
    throw new AppError('Food not found', {
      type: 'warn',
      code: 'FOOD_NOT_FOUND',
      caution: 'No food exist with that ID',
      context: {
        attemptId: id,
        collection: 'food',
      },
    });
  }

  if (category) {
    const categoryExist = await categoryRepository.findCategoryById(id);

    if (!categoryExist) {
      throw new AppError('Category not found', {
        type: 'warn',
        code: 'CATEGORY_NOT_FOUND',
        caution: 'No category exist with that ID',
        context: {
          attemptId: id,
          collection: 'category',
        },
      });
    }
    food.category = category;
  }

  if (file) {
    const uploadResult = await uploadToCloudinary(file.buffer);

    if (food.imagePublicId) {
      await deleteFromCloudinary(food.imagePublicId);
    }

    food.imageUrl = uploadResult.secure_url;
    food.imagePublicId = uploadResult.public_id;
  }

  if (name && name.trim() !== '') food.name = name;
  if (description !== undefined) {
    food.description =
      typeof description === 'string' ? description.trim() : description;
  }

  if (price !== undefined) {
    if (typeof price === 'number' && price >= 0) {
      food.price = price;
    } else {
      throw new AppError('Invalid price', {
        type: 'warn',
        code: 'INVALID_INPUT',
      });
    }
  }

  if (stock !== undefined) {
    if (typeof stock === 'number' && stock >= 0) {
      food.stock = stock;
    } else {
      throw new AppError('Invalid stock', {
        type: 'warn',
        code: 'INVALID_INPUT',
      });
    }
  }

  const updatedFood = await foodRepository.saveFoodDocument(food);

  if (!updatedFood) {
    throw new AppError('Update failed', {
      type: 'error',
      code: 'DATABASE_UPDATE_FAILED',
      caution: 'Failed to save updated data to database',
      context: {
        foodId: id,
        collection: 'food',
      },
    });
  }

  return { updatedFood };
};

export const deleteFoodService = async (params) => {
  const { id } = params;

  const food = await foodRepository.findFoodById(id);

  if (!food) {
    throw new AppError('Food not found', {
      type: 'warn',
      code: 'FOOD_NOT_FOUND',
      caution: 'No food exist with that ID',
      context: {
        attemptId: id,
        collection: 'food',
      },
    });
  }

  if (food.imagePublicId) {
    try {
      await deleteFromCloudinary(food.imagePublicId);
    } catch (err) {
      console.error('Cloudinary delete failed:', err.message);
    }
  }

  await food.deleteOne();

  if (!result) {
    throw new AppError('Failed to delete data from database', {
      type: 'error',
      code: 'DATABASE_DELETE_FAILED',
    });
  }

  return { id };
};
