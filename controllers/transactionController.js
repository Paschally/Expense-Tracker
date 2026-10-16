
import Transaction from "../models/transactionModel.js";
import Category from "../models/categoryModel.js";

// Create a transaction
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, category, transaction_date } = req.body;
    const userId = req.userInfo?.userId;
    // const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Please log in" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const validCategory = await Category.findOne({
      _id: category,
      type,
      $or: [
        { owner: userId, is_system: false },
        { owner: null, is_system: true },
      ],
    });

    if (!validCategory) {
      return res.status(400).json({
        message: "Invalid category for this transaction type",
      });
    }

    const transaction = await Transaction.create({
      user: userId,
      type,
      amount,
      description,
      category,
      transaction_date,
    });

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all transactions belonging to the logged-in user
export const getTransactions = async (req, res) => {
  try {
    const userId = req.userInfo?.userId;
    // const userId = req.user?.userId || req.user?.id;

    const transactions = await Transaction.find({ user: userId })
      .populate("category", "name type")
      .sort({ transaction_date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one transaction
export const getSingleTransaction = async (req, res) => {
  try {
    const userId = req.userInfo?.userId;
    // const userId = req.user?.userId || req.user?.id;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: userId,
    }).populate("category", "name type");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a transaction
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.userInfo?.userId;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const { type, amount, description, category, transaction_date } = req.body;

    const newType = type || transaction.type;
    const newCategory = category || transaction.category;

    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    if (type || category) {
      const validCategory = await Category.findOne({
        _id: newCategory,
        type: newType,
        $or: [
          { owner: userId, is_system: false },
          { owner: null, is_system: true },
        ],
      });

      if (!validCategory) {
        return res.status(400).json({
          message: "Invalid category for this transaction type",
        });
      }
    }

    transaction.type = newType;
    if (amount !== undefined) transaction.amount = amount;
    if (description !== undefined) transaction.description = description;
    transaction.category = newCategory;
    if (transaction_date !== undefined) {
      transaction.transaction_date = transaction_date;
    }

    await transaction.save();

    res.status(200).json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
  try {
    console.log("Authenticated user:", req.user);
    const userId = req.userInfo?.userId;

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
