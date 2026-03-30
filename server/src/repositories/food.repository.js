import Food from '../models/food.model.js';

export const findFoods = async (filter, skip, limit) => {
  return await Food.find(filter)
    .populate('category', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
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
