// This model defines the categories used to organize transactions, such as food, transport, salary, and business income.
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Category name is required"],
      trim: true, 
      maxlength: [60, "Category name cannot exceed 60 characters"] 
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null 
    },
    is_system: { 
      type: Boolean, 
      default: false 
    },
    icon: { 
      type: String, 
      default: "📁" 
    },
  },
  { timestamps: true }
);

// Prevent duplicate category names for the same owner, name, and type combination
categorySchema.index(
  { owner: 1, name: 1, type: 1 },
  { unique: true }
);

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;