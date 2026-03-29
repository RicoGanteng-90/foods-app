import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  updateCategoryController,
} from '../controllers/category.controller.js';
import { Router } from 'express';

const router = Router();

router.get('/', getAllCategoriesController);

router.post('/add', createCategoryController);

router.put('/update/:id', updateCategoryController);

router.delete('/delete/:id', deleteCategoryController);

export default router;
