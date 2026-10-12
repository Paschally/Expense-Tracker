/*
This controller manages the core features of the Expense Tracker: 
creating, viewing, updating, and deleting income and expense records.
The most important security rule is that every transaction query is scoped to the authenticated user's ID. 
One user must not be able to access another user's transactions simply by changing an ID in the URL.
*/

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

  } catch(error){
    
  }
}

// Get all transactions belonging to the logged-in user
const getTransactions = async (req, res) => {
  try{

  } catch(error){
    
  }
};
 
// Get one transaction belonging to the logged-in user
const getSingleTransaction = async (req, res) => {
  try{

  } catch(error){
    
  }
};

// Update a transaction belonging to the logged-in user
const updateTransaction = async (req, res) => {
  try{

  } catch(error){
    
  }
}

// Delete a transaction belonging to the logged-in user
const deleteTransaction = async (req, res) => {
  try{

  } catch(error){

  }
}

module.exports = {createTransaction,
  getTransactions,
  getSingleTransaction,
  updateTransaction,
  deleteTransaction};
      