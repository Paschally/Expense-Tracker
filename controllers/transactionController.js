/*
This controller manages the core features of the Expense Tracker: 
creating, viewing, updating, and deleting income and expense records.
The most important security rule is that every transaction query is scoped to the authenticated user's ID. 
One user must not be able to access another user's transactions simply by changing an ID in the URL.
*/

const mongoose = require('mongoose');
const Transaction = require('../models/transaction_model');
const Category = require('../models/category_model')

// Check that a category is available to this user
// and matches the transaction type.
const findValidCategory = async (category_id, user_id, type) => {
  if (!category_id) return null;

  if (!["income", "expense"].includes(type)) {
    return null;
  }

  return Category.findOne({
    _id: category_id,
    type,
    $or: [
      { owner: null },
      { owner: user_id },
    ],
  });
};

// Create a transaction
const createTransaction = async (req, res) => {
  try{
    const { type, amount, description, category, transaction_date } = req.body;

    if (!type || amount === undefined || !description || !category) {
      return res.status(400).json({
        message: "type, amount, description and category are required",
      });
    }

    if (!mongoose.isValidObjectId(category)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // The category must belong to this user (or be a default one)
    // and must match the transaction type.
    const validCategory = await findValidCategory(category, req.user._id, type);
    if (!validCategory) {
      return res.status(400).json({
        message: "Category is invalid or does not match the transaction type",
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      description,
      category: validCategory._id,
      transaction_date,
    });

    await transaction.populate("category", "name type");

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch(error){
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Server error while creating transaction",
      error: error.message,
    });
  }
}

// Get all transactions belonging to the logged-in user
const getTransactions = async (req, res) => {
  try{
    const { type, category, start_date, end_date } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

    // Always scope the query to the logged-in user
    const filter = { user: req.user._id };

    if (type) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({ message: "type must be income or expense" });
      }
      filter.type = type;
    }

    if (category) {
      if (!mongoose.isValidObjectId(category)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      filter.category = category;
    }

    if (start_date || end_date) {
      filter.transaction_date = {};
      if (start_date) {
        const start = new Date(start_date);
        if (isNaN(start)) {
          return res.status(400).json({ message: "Invalid start_date" });
        }
        filter.transaction_date.$gte = start;
      }
      if (end_date) {
        const end = new Date(end_date);
        if (isNaN(end)) {
          return res.status(400).json({ message: "Invalid end_date" });
        }
        filter.transaction_date.$lte = end;
      }
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("category", "name type")
        .sort({ transaction_date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      count: transactions.length,
      transactions,
    });
  } catch(error){
    return res.status(500).json({
      message: "Server error while fetching transactions",
      error: error.message,
    });
  }
};
 
// Get one transaction belonging to the logged-in user
const getSingleTransaction = async (req, res) => {
  try{
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    // Matching on both _id and user stops one user reading another's data
    const transaction = await Transaction.findOne({
      _id: id,
      user: req.user._id,
    }).populate("category", "name type");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json({ transaction });
  } catch(error){
    return res.status(500).json({
      message: "Server error while fetching transaction",
      error: error.message,
    });
  }
};

// Update a transaction belonging to the logged-in user
const updateTransaction = async (req, res) => {
  try{
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const transaction = await Transaction.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Only these fields can be changed. The owner can never be reassigned.
    const allowedFields = ["type", "amount", "description", "category", "transaction_date"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update" });
    }

    // If the type or category changes, the final combination must still be valid
    if (updates.type !== undefined || updates.category !== undefined) {
      const finalType = updates.type !== undefined ? updates.type : transaction.type;
      const finalCategory = updates.category !== undefined ? updates.category : transaction.category;

      if (!mongoose.isValidObjectId(finalCategory)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const validCategory = await findValidCategory(finalCategory, req.user._id, finalType);
      if (!validCategory) {
        return res.status(400).json({
          message: "Category is invalid or does not match the transaction type",
        });
      }
      updates.category = validCategory._id;
    }

    // Using set + save so the schema validators run on the updated values
    transaction.set(updates);
    await transaction.save();
    await transaction.populate("category", "name type");

    return res.status(200).json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch(error){
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Server error while updating transaction",
      error: error.message,
    });
  }
}

// Delete a transaction belonging to the logged-in user
const deleteTransaction = async (req, res) => {
  try{
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json({ message: "Transaction deleted successfully" });
  } catch(error){
    return res.status(500).json({
      message: "Server error while deleting transaction",
      error: error.message,
    });
  }
}

module.exports = {createTransaction,
  getTransactions,
  getSingleTransaction,
  updateTransaction,
  deleteTransaction};