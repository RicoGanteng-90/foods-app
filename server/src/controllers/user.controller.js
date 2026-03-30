import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getAllUsersService,
  getUserService,
  updateUserService,
  userDeleteService,
} from '../services/user.service.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const { user } = await getAllUsersService();

  res.status(200).json({
    success: true,
    message: 'Users found',
    user,
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { user } = await getUserService(id);

  res.status(200).json({ success: true, message: 'User found', user });
});

export const userUpdateController = asyncHandler(async (req, res) => {
  const { name, address } = req.body;
  const { id: userId } = req.user;

  const { user } = await updateUserService(userId, { name, address });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user,
  });
});

export const userDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.user;

  await userDeleteService(id);

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    id,
  });
});
