/*
- user links a transaction to its owner.
- type distinguishes income from expenses.
- amount stores the transaction amount, which must be positive.
- category references the category document.
- transaction_date records when the financial activity happened.
- notes allows additional details.
- The indexes help MongoDB retrieve transactions efficiently.
For example, a transaction document might represent a ₦5,000 transport expense. 
The user and category fields store MongoDB ObjectIds rather than the complete user and category documents.
*/
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User",
      required: true, index: true},
    type: { type: String,
      enum: ["income", "expense"], required: true},
    amount: { type: Number, required: true,
      min: [0.01, "Amount must be greater than zero"]},
    description: { type: String, required: true, trim: true,
      maxlength: [250, "Description cannot exceed 250 characters"]},
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", 
      required: true},
    transaction_date: { type: Date, required: true, default: Date.now},
    }, { timestamps: true }
);

const transactionModel = mongoose.model( "Transaction", transactionSchema);

module.exports = transactionModel;