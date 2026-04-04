import User from '../models/user.model.js';

export const findMe = async (userId) => {
  return await User.findById(userId).select('-password -refreshTokens').lean();
};

export const findUserById = async (userId) => {
  return await User.findById(userId);
};

export const findCredentialByQuery = async (query) => {
  return await User.findOne(query).select('+password');
};

export const findByRefreshToken = async (userId, refreshToken) => {
  return await User.findOne({
    _id: userId,
    'refreshTokens.token': refreshToken,
  });
};

export const createCredential = async (data) => {
  return await User.create(data);
};

export const addRefreshToken = async (userId, tokenData) => {
  return await User.updateOne(
    { _id: userId },
    {
      $push: {
        refreshTokens: {
          $each: [tokenData],
          $slice: -5,
        },
      },
    }
  );
};

export const rotateRefreshToken = async (userId, oldToken, newTokenEntry) => {
  await User.findOneAndUpdate(
    { _id: userId, 'refreshTokens.token': oldToken },
    { $set: { 'refreshTokens.$': newTokenEntry } },
    { returnDocument: 'after', runValidators: true }
  );
};

export const deleteByTokenFamily = async (userId, tokenFamily) => {
  return await User.updateOne(
    { _id: userId },
    { $pull: { refreshTokens: { tokenFamily } } }
  );
};

export const deleteRefreshToken = async (userId, refreshToken) => {
  return await User.updateOne(
    { _id: userId },
    { $pull: { refreshTokens: { token: refreshToken } } }
  );
};

export const deleteExpiredToken = async (userId) => {
  return await User.updateOne(
    { _id: userId },
    { $pull: { refreshTokens: { expiresAt: { $lt: new Date() } } } }
  );
};
