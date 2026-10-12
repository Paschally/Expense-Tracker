
const express = require('express');
const { createTransaction,
        getTransactions,
        updateTransaction,
        deleteTransaction} = require('../controllers/transaction_controller.js');

const authMiddleware = require('../middleware/auth_middleware.js');

const transactionRouter = express.Router();

// All transaction endpoints require authentication
transactionRouter.use(authMiddleware);

// Create a transaction
transactionRouter.post("/", create_transaction);

// Get all transactions, with optional filters
transactionRouter.get("/", get_transactions);

// Get one transaction by ID
transactionRouter.get("/:transaction_id", get_transaction);

// Update a transaction
transactionRouter.patch("/:transaction_id", update_transaction);

// Delete a transaction
transactionRouter.delete("/:transaction_id", delete_transaction);

module.exports = transactionRouter;
