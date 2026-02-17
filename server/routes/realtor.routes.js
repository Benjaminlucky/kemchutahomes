import express from "express";
import {
  signup,
  login,
  updateAvatar,
  getRealtors,
  getRealtorById,
  updateRealtor,
  deleteRealtor,
  getDashboard,
  getMyRecruits,
  forgotPassword,
  resetPassword, // ✅ Import the new controller
} from "../controllers/realtor.controller.js";

import { uploadSingleImage } from "../middlewares/upload.middleware.js";
import { protect, protectAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Public routes
router.post("/signup", signup);
router.post("/login", login);

// ✅ IMPORTANT: Specific routes BEFORE parameterized routes
router.get("/dashboard", protect, getDashboard);
router.get("/my-recruits", protect, getMyRecruits); // ✅ New route for getting recruits
router.put("/avatar", protect, uploadSingleImage, updateAvatar);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ✅ Admin routes (parameterized routes LAST)
router.get("/", protectAdmin, getRealtors);
router.get("/:id", protectAdmin, getRealtorById);
router.put("/:id", protectAdmin, updateRealtor);
router.delete("/:id", protectAdmin, deleteRealtor);

export default router;
