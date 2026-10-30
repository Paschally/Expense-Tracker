import express from "express";

import {
  registerUser,
  loginUser,
  getAllUsers,
  deleteUser,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// Admin-only routes
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.delete("/delete-user/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;
