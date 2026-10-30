/*
This controller creates, lists, updates, and deletes categories. Users can manage their own categories, 
while shared system categories are readable but cannot be changed or deleted by ordinary users.
*/

const Category = require("../models/category_model.js");
const Transaction = require("../models/transaction_model.js");

// Create a category
const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name.trim() || !["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "A category name and valid type are required",
      });
    }
    const category = await Category.create({
      name, type, owner: req.user.id, is_system: false,
    });
    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    return res.status(400).json({
        message: 'Failed to create category'
      });
    }
};

// Get shared categories and the current user's categories
const getCategories = async (req, res) => {
  try{

  } catch(error){

  }
};

// Update a category owned by the current user
const updateCategory = async (req, res) => {
  try{

  } catch(error){

  }
};

// Delete a category owned by the current user
const deleteCategory = async (req, res) => {
  try{

  } catch(error){

  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
}


