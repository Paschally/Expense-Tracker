import categoryModel from "./categoryModel.js"; 

// Create a new custom category
  // POST api/categories
 
export const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const userId = req.user.id;

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }

    // Check if the user already has a category with this exact name
    const existingCategory = await categoryModel.findOne({
      name: name.trim(),
      owner: userId,
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const newCategory = await categoryModel.create({
      name,
      type,
      owner: userId,
      is_system: false, 
    });

    return res.status(201).json({
      success: true,
      data: newCategory,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all categories (System default + User specific)
 //  GET /api/categories
 
export const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    // Query both global system categories and the logged-in user's categories
    const query = {
      $or: [
        { is_system: true },
        { owner: userId }
      ]
    };

    // If type query param is provided, filter by it
    if (type === "income" || type === "expense") {
      query.type = type;
    }

    const categories = await categoryModel.find(query).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update a custom category
  //  PUT /api/categories/:id
 
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const userId = req.user.id;

    // Find the category first to check ownership
    const category = await categoryModel.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Prevent users from changing system categories
    if (category.is_system) {
      return res.status(403).json({ message: "System categories cannot be modified" });
    }

    // Ensure the logged-in user owns this category
    if (category.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this category" });
    }

    // Apply updates safely
    if (name) category.name = name;
    if (type) category.type = type;

    const updatedCategory = await category.save();

    return res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a custom category
  //  DELETE /api/categories/:id
 
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const category = await categoryModel.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Prevent users from deleting system categories
    if (category.is_system) {
      return res.status(403).json({ message: "System categories cannot be deleted" });
    }

    // Ensure the logged-in user owns this category
    if (category.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this category" });
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Category removed successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
