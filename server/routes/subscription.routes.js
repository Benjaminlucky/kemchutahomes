import express from "express";
import {
  createSubscription,
  getAllSubscriptions,
  updateSubscriptionStatus,
} from "../controllers/subscription.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", createSubscription); // Public
router.get("/", protect, isAdmin, getAllSubscriptions); // Admin
router.patch("/:id/status", protect, isAdmin, updateSubscriptionStatus); // Admin

export default router;
