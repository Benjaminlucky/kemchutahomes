import express from "express";
import {
  getROISettings,
  updateROISettings,
  submitBuy2SellLead,
  getAllLeads,
  updateLeadStatus,
} from "../controllers/buy2sell.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.get("/roi", getROISettings); // frontend reads ROI
router.post("/leads", submitBuy2SellLead); // form submission

// Admin only
router.put("/roi", protect, isAdmin, updateROISettings);
router.get("/leads", protect, isAdmin, getAllLeads);
router.patch("/leads/:id/status", protect, isAdmin, updateLeadStatus);

export default router;
