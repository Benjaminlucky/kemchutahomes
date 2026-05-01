import express from "express";
import {
  createSubscription,
  getAllSubscriptions,
  getMySubscriptions,
  updateSubscriptionStatus,
  recordPayment,
  confirmPayment,
  allocatePlot,
  downloadDocument,
} from "../controllers/subscription.controller.js";
import {
  protect,
  isAdmin,
  protectClient,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/", createSubscription);

// ── Client portal ─────────────────────────────────────────────────────────────
router.get("/my", protectClient, getMySubscriptions);
router.get("/:id/documents/:docType", protectClient, downloadDocument);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/", protect, isAdmin, getAllSubscriptions);
router.patch("/:id/status", protect, isAdmin, updateSubscriptionStatus);
router.post("/:id/payments", protect, isAdmin, recordPayment); // Step 1: log payment
router.patch(
  "/:id/payments/:paymentId/confirm",
  protect,
  isAdmin,
  confirmPayment,
); // Step 2: confirm → Receipt PDF
router.patch("/:id/allocate", protect, isAdmin, allocatePlot);
router.get("/:id/documents/:docType", protect, isAdmin, downloadDocument);

export default router;
