import Category from '../models/category.model';

export const findCategories = async () => {
  return await Category.findOne();
};

export const findCategoryByQuery = async (query) => {
  await Category.findOne(query);
};

export const findCategoryById = async (id) => {
  await Category.findById(id);
};

export const createCategory = async (data) => {
  return await Category.create(data);
};

export const saveCategoryDocument = async () => {
  return await Category.save();
};

export const updateCategoryById = async (id, updatedData) => {
  return await Category.findByIdAndUpdate(
    id,
    { $set: updatedData },
    { $returnDocument: 'after', $runValidators: true }
  );
};

export const deleteCategoryById = async (id) => {
  return await Category.findByIdAndDelete(id);
};
