import express from "express";
import {
  bookInspection,
  getAllInspections,
  updateInspectionStatus,
  updateInspectionNotes,
} from "../controllers/inspection.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", bookInspection); // Public
router.get("/", protect, isAdmin, getAllInspections); // Admin
router.patch("/:id/status", protect, isAdmin, updateInspectionStatus); // Admin
router.patch("/:id/notes", protect, isAdmin, updateInspectionNotes); // Admin

export default router;
