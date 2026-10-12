
const express = require('express');
const { createCategory,
        getCategories,
        updateCategory,
        deleteCategory} = require('../controllers/category_controller.js');

const authMiddleware = require('../middleware/authMiddleware.js');

const categoryRouter = express.Router();

// All category endpoints require authentication
categoryRouter.use(auth_middleware);
// Create a category
categoryRouter.post("/", create_category);
// Get the user's categories and shared categories
categoryRouter.get("/", get_categories);
// Update a category
categoryRouter.patch("/:category_id", update_category);
// Delete a category
categoryRouter.delete("/:category_id", delete_category);

module.export =  category_router;
