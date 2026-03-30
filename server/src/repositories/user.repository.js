import User from '../models/user.model';

export const findUser = async () => {
  return await User.find().select('-password -refreshTokens');
};

export const findUserById = async (userId) => {
  return await User.findById(userId).select('-password -refreshTokens');
};

export const updateUserById = async (userId, updateField) => {
  return await User.findByIdAndUpdate(
    userId,
    { $set: updateField },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );
};

export const deleteUserById = async (userId) => {
  return await User.findByIdAndDelete(userId);
};
