import { Router } from 'express';
import {
  loginUser,
  logoutController,
  registerUser,
  getMe,
  refresh,
  verifyRefresh,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/logout', logoutController);

router.post('/refresh', refresh);

router.post('/verify-refresh', verifyRefresh);

router.get('/me', authenticate, getMe);

export default router;
