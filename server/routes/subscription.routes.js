import express from "express";
import jwt from "jsonwebtoken";
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

// ── protectAdminOrClient ──────────────────────────────────────────────────────
// Decodes the JWT first to check role, then runs the correct middleware.
// This avoids protect() calling res.status(401) directly for client tokens
// (which breaks the callback chain and causes "User not found").
const protectAdminOrClient = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. No token." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Route to the correct middleware based on role in the token
    if (decoded.role === "client") {
      return protectClient(req, res, next);
    }
    // Admin or Realtor — run protect then isAdmin
    protect(req, res, (err) => {
      if (err) return next(err);
      isAdmin(req, res, (err2) => {
        if (err2) return res.status(403).json({ message: "Access denied." });
        next();
      });
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ── Public
router.post("/", createSubscription);

// ── Shared (admin OR client)
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
