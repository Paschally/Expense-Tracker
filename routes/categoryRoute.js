import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all category routes below
router.use(authMiddleware);

// ==========================================
// CATEGORY ROUTES
// Base URL: /api/categories
// ==========================================

// @route   POST /api/categories
// @desc    Create a new custom category
router.post("/", createCategory);

// @route   GET /api/categories
// @desc    Get all system defaults and user-specific categories
router.get("/", getCategories);

// @route   PUT /api/categories/:id (also supports PATCH)
// @desc    Update a custom category by ID
router.put("/:id", updateCategory);
router.patch("/:id", updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete a custom category by ID
router.delete("/:id", deleteCategory);

export default router;