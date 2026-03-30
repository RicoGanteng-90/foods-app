import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getMeService,
  loginService,
  logoutService,
  refreshService,
  registerService,
  silentRefreshService,
} from '../services/auth.service.js';

export const getMe = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const { user } = await getMeService(id);

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    user,
  });
});

export const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user } = await registerService(email, password);

  res.status(201).json({
    success: true,
    message: 'Register successful',
    user,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const clientInfo = {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  };

  const { accessToken, refreshToken, user } = await loginService(
    email,
    password,
    clientInfo
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    accessToken,
    user,
  });
});

export const logoutController = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  const { id } = req.user;

  await logoutService(refreshToken, id);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  const clientInfo = {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  };

  const { newAccessToken, newRefreshToken } = await refreshService(
    refreshToken,
    clientInfo
  );

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Access token refreshed',
    newAccessToken,
  });
});

export const verifyRefresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  const { newAccessToken, user } = await silentRefreshService(refreshToken);

  res.status(200).json({
    success: true,
    message: 'Refresh token is valid',
    newAccessToken,
    user,
  });
});
