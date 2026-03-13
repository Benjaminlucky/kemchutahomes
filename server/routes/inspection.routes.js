import express from "express";
import {
  bookInspection,
  getAllInspections,
  updateInspectionStatus,
} from "../controllers/inspection.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public — anyone can book
router.post("/", bookInspection);

// Admin only
router.get("/", protect, isAdmin, getAllInspections);
router.patch("/:id/status", protect, isAdmin, updateInspectionStatus);

export default router;
