import express from "express";

import {uploadImage} from "../controllers/imageController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js"

const router = express.Router();

// Upload image require authentication
router.post("/upload", authMiddleware, adminMiddleware, uploadMiddleware.single('image'), uploadImage);

export default router;