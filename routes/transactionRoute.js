import express from "express";

import {
  createTransaction,
  getTransactions,
  getSingleTransaction,
  updateTransaction,
  deleteTransaction} from "../controllers/transactionController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All transaction routes require authentication
// POST /api/transactions - Create a transaction
router.post("/create-tran/",authMiddleware, createTransaction);

// GET /api/transactions - Get all user's transactions
router.get("/get-all/", authMiddleware, getTransactions);

// GET /api/transactions/:id - Get one transaction
router.get("/get-one/:id", authMiddleware, getSingleTransaction);

// PUT /api/transactions/:id - Update a transaction
router.patch("/update-tran/:id", authMiddleware, updateTransaction);

// DELETE /api/transactions/:id - Delete a transaction
router.delete("/delete-tran/:id", authMiddleware, deleteTransaction);

export default router;