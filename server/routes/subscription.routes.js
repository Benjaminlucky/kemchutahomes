import express from "express";
import {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  getMySubscriptions,
  updateSubscriptionStatus,
  confirmSubscription,
  addNote,
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

// Middleware that accepts EITHER an admin token OR a client token
// Used for routes that both admin and client need to access (e.g. document download)
const protectAdminOrClient = (req, res, next) => {
  // Try admin auth first
  protect(req, res, (adminErr) => {
    if (!adminErr) {
      // Admin token valid — check isAdmin
      isAdmin(req, res, (adminRoleErr) => {
        if (!adminRoleErr) return next(); // admin passes
        // Valid token but not admin — try client auth
        protectClient(req, res, next);
      });
    } else {
      // Not an admin token — try client auth
      protectClient(req, res, next);
    }
  });
};

// ── Public
router.post("/", createSubscription);

// ── Shared (admin OR client) — must be registered before the specific /:id routes
router.get("/:id/documents/:docType", protectAdminOrClient, downloadDocument);

// ── Client portal
router.get("/my", protectClient, getMySubscriptions);

// ── Admin
router.get("/", protect, isAdmin, getAllSubscriptions);
router.get("/:id", protect, isAdmin, getSubscriptionById);
router.patch("/:id/status", protect, isAdmin, updateSubscriptionStatus);
router.patch("/:id/confirm", protect, isAdmin, confirmSubscription);
router.post("/:id/notes", protect, isAdmin, addNote);
router.post("/:id/payments", protect, isAdmin, recordPayment);
router.patch(
  "/:id/payments/:paymentId/confirm",
  protect,
  isAdmin,
  confirmPayment,
);
router.patch("/:id/allocate", protect, isAdmin, allocatePlot);

export default router;
