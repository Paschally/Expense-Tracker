// This model defines the categories used to organize transactions, such as food, transport, salary, and business income.
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: [true, "Category name is required"],
      trim: true, maxlength: [60, "Category name cannot exceed 60 characters"]},
    type: { type: String, enum: ["income", "expense"], required: true},
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null},
    is_system: { type: Boolean, default: false}
    }, { timestamps: true }
);

const categoryModel = mongoose.model("Category", categorySchema);

module.exports = categoryModel;
/*
- name stores the category name.
- type determines whether the category is for income or expenses.
- owner references a user. A null owner can represent a shared, system-wide category.
- is_system identifies categories managed by the application.
*/