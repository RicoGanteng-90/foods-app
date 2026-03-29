import * as authRepository from '../repositories/auth.repository.js';
import AppError from '../utils/AppError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../utils/jwt.js';

export const getMeService = async (userId) => {
  const user = await authRepository.findMe(userId);
  if (!user) {
    throw new AppError('User not found', {
      type: 'error',
      code: 'NOT_FOUND',
      caution: 'Cannot find user with affiliated ID',
    });
  }

  return { user };
};

export const registerService = async (body) => {
  const { email, password } = body;

  if (!email || !password) {
    throw new AppError('Email and password are required', {
      type: 'warn',
      code: 'VALIDATION_ERROR',
      caution: 'Please fill all the fields',
    });
  }

  const existingUser = await authRepository.findCredentialByQuery({ email });

  if (existingUser) {
    throw new AppError('Email already exist', {
      type: 'warn',
      code: 'DUPLICATE_RECORD',
      caution: 'Please provide a different email',
    });
  }

  const user = await authRepository.createCredential({
    email,
    password,
  });

  return { user };
};

export const loginService = async (body, clientInfo) => {
  const { email, password } = body;

  if (!email || !password) {
    throw new AppError('Email and password are required', {
      type: 'warn',
      code: 'VALIDATION_ERROR',
      caution: 'Please fill all the fields',
    });
  }

  const user = await authRepository.findCredentialByQuery({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', {
      type: 'warn',
      code: 'UNAUTHORIZED',
      caution: 'Please check your email and password again',
    });
  }

  const tokenFamily = crypto.randomUUID();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, tokenFamily);

  await authRepository.addRefreshToken(user._id, {
    token: refreshToken,
    tokenFamily,
    device: clientInfo.userAgent,
    ip: clientInfo.ip,
    createdAt: new Date(),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  };
};

export const logoutService = async (cookies, userId) => {
  const { refreshToken } = cookies;

  if (refreshToken && userId) {
    await authRepository.deleteRefreshToken(userId, refreshToken);
  }

  return;
};

export const refreshService = async (cookies, clientInfo) => {
  const { refreshToken } = cookies;

  if (!refreshToken) {
    throw new AppError('No refresh token provided', { code: 'UNAUTHORIZED' });
  }

  const decoded = verifyToken(refreshToken, true);

  const user = await authRepository.findUserById(decoded.id);

  if (!user || !user.refreshTokens || user.refreshTokens.length === 0) {
    throw new AppError('User not found', {
      code: 'NOT_FOUND',
    });
  }

  const matchedToken = user.refreshTokens.find(
    (rt) => rt.token === refreshToken
  );

  if (!matchedToken) {
    await authRepository.deleteByTokenFamily(user._id, decoded.tokenFamily);

    throw new AppError('Token reuse detected', {
      code: 'INVALID_TOKEN',
      caution:
        'Someone tried to use your old token, all session family has been removed',
    });
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user, matchedToken.tokenFamily);

  const updatedTokenArray = user.refreshTokens.filter(
    (rt) => rt.token !== refreshToken
  );

  updatedTokenArray.push({
    token: newRefreshToken,
    tokenFamily: matchedToken.tokenFamily,
    device: clientInfo.userAgent,
    ip: clientInfo.ip,
    createdAt: new Date(),
  });

  await authRepository.updateRefreshTokenArray(user._id, updatedTokenArray);

  return { newAccessToken, newRefreshToken };
};
