
import mongoose from "mongoose";
import Category from "../models/categoryModel.js";

// Create a custom category
// POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const userId = req.userInfo?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be income or expense",
      });
    }
    const trimmedName = name.trim();

    const existingCategory = await Category.findOne({
      name: trimmedName,
      owner: userId,
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category name already exists",
      });
    }

    const newCategory = await Category.create({
      name: trimmedName,
      type,
      owner: userId,
      is_system: false
    });

    return res.status(201).json({
      success: true,
      data: newCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category name already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get system categories and the logged-in user's categories
// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const userId = req.userInfo?.userId;
    const { type } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be income or expense",
      });
    }

    const query = {
      $or: [
        { is_system: true },
        { owner: userId, is_system: false },
      ],
    };

    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update a custom category
// PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const userId = req.userInfo?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if ( name === undefined && type === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide a name, or type to update",
      });
    }

    if (
      name !== undefined &&
      (typeof name !== "string" ||
        !name.trim() ||
        name.trim().length > 60)
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 1 and 60 characters",
      });
    }

    if (
      type !== undefined &&
      !["income", "expense"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Type must be income or expense",
      });
    }
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.is_system) {
      return res.status(403).json({
        success: false,
        message: "System categories cannot be modified",
      });
    }

    if (
      !category.owner ||
      category.owner.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this category",
      });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();

      const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        owner: userId,
        name: trimmedName,
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Category name already exists",
        });
      }

      category.name = trimmedName;
    }

    if (type !== undefined) {
      category.type = type;
    }
    const updatedCategory = await category.save();

    return res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category name already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a custom category
// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userInfo?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.is_system) {
      return res.status(403).json({
        success: false,
        message: "System categories cannot be deleted",
      });
    }

    if (
      !category.owner ||
      category.owner.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this category",
      });
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Category removed successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
