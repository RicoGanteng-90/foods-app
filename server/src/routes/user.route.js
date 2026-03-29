import { Router } from 'express';
import {
  getAllUsers,
  getUser,
  userDeleteController,
  userUpdateController,
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = Router();

router.get('/', getAllUsers);

router.get('/user/:id', authenticate, getUser);

router.put('/update-user/:id', authenticate, userUpdateController);

router.delete('/delete-user/:id', authenticate, userDeleteController);

export default router;
