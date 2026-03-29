import User from '../models/user.model.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../utils/jwt.js';
import {
  getMeService,
  loginService,
  logoutService,
  refreshService,
  registerService,
} from '../services/auth.service.js';

export const getMe = asyncHandler(async (req, res) => {
  const { user } = await getMeService(req.user.id);

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    user,
  });
});

export const registerUser = asyncHandler(async (req, res) => {
  const { user } = await registerService(req.body);

  res.status(201).json({
    success: true,
    message: 'Register successful',
    user,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const clientInfo = {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  };

  const { accessToken, refreshToken, user } = await loginService(
    req.body,
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
  await logoutService(req.cookies, req.user.id);

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
  const clientInfo = {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  };

  const { newAccessToken, newRefreshToken } = await refreshService(
    req.cookies,
    clientInfo
  );

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
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

  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: 'No refresh token' });
  }

  const decoded = verifyToken(refreshToken, true);

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(400).json({ success: false, message: 'User not found' });
  }

  const matchedToken = user.refreshTokens.find(
    (rt) => rt.token === refreshToken
  );

  if (!matchedToken) {
    await User.updateOne(
      { _id: user._id },
      { $pull: { refreshTokens: { token: refreshToken } } }
    );

    return res
      .status(401)
      .json({ success: false, message: 'Invalid refresh token' });
  }

  const accessToken = generateAccessToken(user, matchedToken.tokenFamily);

  res.status(200).json({
    success: true,
    message: 'Refresh token is valid',
    result: accessToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});
