import { Router } from 'express';
import {
  getAllUsers,
  getUser,
  userDeleteController,
  userUpdateController,
  userDeleteByAdminController,
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = Router();

router.get('/', getAllUsers);

router.get('/:id', authenticate, getUser);

router.put('/:id', authenticate, userUpdateController);

router.delete('/me', authenticate, userDeleteController);

router.delete('/:id', authenticate, userDeleteByAdminController);

export default router;
