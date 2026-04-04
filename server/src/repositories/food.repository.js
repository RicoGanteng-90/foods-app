import Food from '../models/food.model.js';
import { queryBuilder } from '../utils/queryBuilder.js';

export const findFoods = (query) => {
  return queryBuilder(Food, query, {
    searchFields: ['name'],
    allowedFilters: ['category'],
    allowedSorts: ['name', 'price', 'createdAt'],
    populate: [{ path: 'category', select: 'name' }],
    defaultSort: { createdAt: -1 },
  });
};

export const countFoods = async (filter) => {
  return await Food.countDocuments(filter);
};

export const createFood = async (data) => {
  return await Food.create(data);
};

export const saveFoodDocument = async (food) => {
  return await food.save();
};

export const findFoodByQuery = async (query) => {
  return await Food.findOne(query).populate('category', 'name');
};

export const findFoodById = async (foodId) => {
  return await Food.findById(foodId).populate('category', 'name');
};

export const updateFoodById = async (id, updatedData) => {
  return await Food.findByIdAndUpdate(
    id,
    { $set: updatedData },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );
};

export const deleteFoodById = async (id) => {
  return await Food.findByIdAndDelete(id);
};

export const decrementStock = async (foodId, quantity, session) => {
  return await Food.findOneAndUpdate(
    { _id: foodId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { session }
  );
};

export const incrementStock = async (foodId, quantity, session) => {
  return await Food.findOneAndUpdate(
    { _id: foodId },
    { $inc: { stock: quantity } },
    { session }
  );
};
