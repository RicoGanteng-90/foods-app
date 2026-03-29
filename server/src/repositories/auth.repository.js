import User from '../models/user.model';

export const findMe = async (id) => {
  return await User.findById(id).select('-password -refreshTokens').lean();
};

export const findUserById = async (userId) => {
  return await User.findById(userId);
};

export const findCredentialByQuery = async (query) => {
  return await User.findOne(query).select('+password');
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

export const updateRefreshTokenArray = async (userId, tokenArray) => {
  return await User.updateOne(
    { _id: userId },
    { $set: { refreshTokens: tokenArray } }
  );
};

export const deleteByTokenFamily = async (userId, tokenFamily) => {
  return await User.updateOne(
    { _id: userId },
    { $pull: { refreshTokens: { tokenFamily: tokenFamily } } }
  );
};

export const deleteRefreshToken = async (userId, refreshToken) => {
  return await User.updateOne(
    { _id: userId },
    { $pull: { refreshTokens: { token: refreshToken } } }
  );
};
