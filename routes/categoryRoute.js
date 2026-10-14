import { Router } from 'express';
import Category from '../models/categoryModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All routes below require authentication
router.use(protect);

// @route   GET /api/categories
// @desc    Get all categories for the current user
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user._id });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/categories
// @desc    Create a new category
router.post('/', async (req, res, next) => {
  try {
    const category = await Category.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category owned by the current user
router.delete('/:id', async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;