/*
This controller manages the core features of the Expense Tracker: 
creating, viewing, updating, and deleting income and expense records.
Every transaction query is strictly scoped to the authenticated user's ID.
*/

import mongoose from "mongoose";
import Transaction from "../models/transactionModel.js";
import Category from "../models/categoryModel.js";

// Helper function to verify that a category exists, belongs to the user or is a system default,
// and matches the transaction type.
const findValidCategory = async (categoryId, userId, type) => {
  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
    return null;
  }

  if (!["income", "expense"].includes(type)) {
    return null;
  }

  return await Category.findOne({
    _id: categoryId,
    type,
    $or: [
      { owner: userId, is_system: false },
      { owner: null, is_system: true },
    ],
  });
};

// ==========================================
// 1. CREATE A TRANSACTION
// POST /api/transactions
// ==========================================
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, category, transaction_date } = req.body;
    const userId = req.userInfo?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!type || amount === undefined || !description || !category) {
      return res.status(400).json({
        message: "Type, amount, description, and category are required",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    // Verify category ownership and type match
    const validCategory = await findValidCategory(category, userId, type);
    if (!validCategory) {
      return res.status(400).json({
        message: "Category is invalid or does not match the transaction type",
      });
    }

    const transaction = await Transaction.create({
      user: userId,
      type,
      amount,
      description,
      category: validCategory._id,
      transaction_date: transaction_date || Date.now(),
    });

    await transaction.populate("category", "name type icon");

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Create transaction error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// 2. GET ALL TRANSACTIONS (With Filtering & Pagination)
// GET /api/transactions
// ==========================================
export const getTransactions = async (req, res) => {
  try {
    const userId = req.userInfo?.userId;
    const { type, category, start_date, end_date } = req.query;
    
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Scope query to logged-in user
    const filter = { user: userId };

    if (type) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({ message: "Type must be income or expense" });
      }
      filter.type = type;
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      filter.category = category;
    }

    if (start_date || end_date) {
      filter.transaction_date = {};
      if (start_date) {
        const start = new Date(start_date);
        if (isNaN(start)) {
          return res.status(400).json({ message: "Invalid start_date format" });
        }
        filter.transaction_date.$gte = start;
      }
      if (end_date) {
        const end = new Date(end_date);
        if (isNaN(end)) {
          return res.status(400).json({ message: "Invalid end_date format" });
        }
        filter.transaction_date.$lte = end;
      }
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("category", "name type icon")
        .sort({ transaction_date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// 3. GET A SINGLE TRANSACTION
// GET /api/transactions/:id
// ==========================================
export const getSingleTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userInfo?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const transaction = await Transaction.findOne({
      _id: id,
      user: userId,
    }).populate("category", "name type icon");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json({ success: true, transaction });
  } catch (error) {
    console.error("Get single transaction error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// 4. UPDATE A TRANSACTION
// PUT /api/transactions/:id
// ==========================================
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userInfo?.userId;
    const { type, amount, description, category, transaction_date } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const transaction = await Transaction.findOne({
      _id: id,
      user: userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const newType = type !== undefined ? type : transaction.type;
    const newCategory = category !== undefined ? category : transaction.category;

    if (type !== undefined && !["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    // If type or category changed, validate the resulting combination
    if (type !== undefined || category !== undefined) {
      const validCategory = await findValidCategory(newCategory, userId, newType);
      if (!validCategory) {
        return res.status(400).json({
          message: "Category is invalid or does not match the transaction type",
        });
      }
      transaction.category = validCategory._id;
    }

    if (type !== undefined) transaction.type = type;
    if (amount !== undefined) transaction.amount = amount;
    if (description !== undefined) transaction.description = description;
    if (transaction_date !== undefined) transaction.transaction_date = transaction_date;

    await transaction.save();
    await transaction.populate("category", "name type icon");

    return res.status(200).json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Update transaction error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// 5. DELETE A TRANSACTION
// DELETE /api/transactions/:id
// ==========================================
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userInfo?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};