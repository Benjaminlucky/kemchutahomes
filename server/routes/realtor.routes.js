// routes/realtor.routes.js
import express from "express";
import { signup } from "../controllers/realtor.controller.js";
import { login } from "../controllers/auth.controller.js";
import { getDashboard } from "../controllers/realtorDashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { updateAvatar } from "../controllers/realtor.controller.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

// Import new controllers
import {
  getRealtors,
  getRealtorById,
  updateRealtor,
  deleteRealtor,
} from "../controllers/realtor.controller.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.get("/dashboard", protect, getDashboard);

// Get all realtors (paginated, searchable, sortable)
router.get("/", protect, getRealtors);

// Get single realtor by ID
router.get("/:id", protect, getRealtorById);

// Update realtor by ID
router.put("/:id", protect, updateRealtor);

// Delete realtor by ID
router.delete("/:id", protect, deleteRealtor);

// Update avatar (protected)
router.put(
  "/avatar",
  protect,
  (req, res, next) =>
    uploadSingleImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Upload error" });
      }
      return next();
    }),
  updateAvatar
);

export default router;
