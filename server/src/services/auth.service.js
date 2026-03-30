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

export const registerService = async (email, password) => {
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

export const loginService = async (email, password, clientInfo) => {
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

export const logoutService = async (refreshToken, userId) => {
  if (refreshToken && userId) {
    await authRepository.deleteRefreshToken(userId, refreshToken);
  }

  return;
};

export const refreshService = async (refreshToken, clientInfo) => {
  if (!refreshToken) {
    throw new AppError('No refresh token provided', { code: 'UNAUTHORIZED' });
  }

  const decoded = verifyToken(refreshToken, true);

  const newAccessToken = generateAccessToken(decoded);
  const newRefreshToken = generateRefreshToken(decoded, decoded.tokenFamily);

  const newTokenEntry = {
    token: newRefreshToken,
    tokenFamily: decoded.tokenFamily,
    device: clientInfo.userAgent,
    ip: clientInfo.ip,
    createdAt: new Date(),
  };

  const updated = await authRepository.rotateRefreshToken(
    decoded._id,
    refreshToken,
    newTokenEntry
  );

  if (!updated) {
    await authRepository.deleteByTokenFamily(decoded._id, decoded.tokenFamily);

    throw new AppError('Token reuse detected', {
      code: 'INVALID_TOKEN',
      caution:
        'Someone tried to use your old token, all session family has been removed',
    });
  }

  return { newAccessToken, newRefreshToken };
};

export const silentRefreshService = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('No refresh token provided', { code: 'UNAUTHORIZED' });
  }

  const decoded = verifyToken(refreshToken, true);

  const user = await authRepository.findByRefreshToken(
    decoded.id,
    refreshToken
  );

  if (!user) {
    await authRepository.deleteByTokenFamily(decoded.id, decoded.tokenFamily);

    throw new AppError('Invalid refresh token', { code: 'UNAUTHORIZED' });
  }

  const newAccessToken = generateAccessToken(decoded);

  return { newAccessToken, user };
};
