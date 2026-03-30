import * as userRepository from '../repositories/user.repository.js';

export const getAllUsersService = async () => {
  const user = await userRepository.findUser();

  return { user };
};

export const getUserService = async (id) => {
  const user = await userRepository.findUserById(id);

  if (!user) {
    throw new AppError('User not found', {
      type: 'warn',
      code: 'NOT_FOUND',
    });
  }

  return { user };
};

export const updateUserService = async (userId, { name, address }) => {
  const updateField = {};

  if (name) updateField.name = name;

  if (address && Object.keys(address) > 0) {
    const allowedAddressFields = ['street', 'city', 'province', 'country'];
    const invalidKeys = Object.keys(address).filter(
      (key) => !allowedAddressFields.includes(key)
    );

    if (invalidKeys.length > 0) {
      throw new AppError('Invalid address fields', {
        type: 'warn',
        code: 'VALIDATION_ERROR',
        caution: `Invalid fields: ${invalidKeys.join(', ')}`,
      });
    }

    Object.keys(address).forEach((key) => {
      updateField[`address.${key}`] = address[key];
    });
  }

  if (Object.keys(updateField).length === 0) {
    throw new AppError('No fields to update', {
      type: 'warn',
      code: 'VALIDATION_ERROR',
    });
  }

  const user = await userRepository.updateUserById(userId, updateField);

  if (!user) {
    throw new AppError('User not found', { code: 'NOT_FOUND' });
  }

  return { user };
};

export const userDeleteService = async (id) => {
  const user = await userRepository.deleteUserById(id);

  if (!user) {
    throw new AppError('User not found', {
      type: 'warn',
      code: 'NOT_FOUND',
    });
  }

  return { id };
};
