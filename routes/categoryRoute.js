import express from "express";

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All category routes require authentication
// POST /api/categories - Create a custom category
router.post("/create-cat", authMiddleware, createCategory);

// GET /api/categories - Get system and user's categories
router.get("/get-cat", authMiddleware, getCategories);

// Patch /api/categories/:id - Update a custom category
router.patch("/update-cat/:id", authMiddleware, updateCategory);

// DELETE /api/categories/:id - Delete a custom category
router.delete("/delete-cat/:id", authMiddleware, deleteCategory);

export default router;
