import express from "express";
import jwt from "jsonwebtoken";
import {
  getROISettings,
  updateROISettings,
  submitBuy2SellLead,
  getAllLeads,
  getLeadById,
  getMyInvestments,
  recordPayment,
  markMatured,
  processPayout,
  downloadDocument,
  updateLeadStatus,
} from "../controllers/buy2sell.controller.js";
import {
  protect,
  isAdmin,
  protectClient,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── protectAdminOrClient — checks token role first, avoids protect() calling
// res.status(401) directly for client tokens (which breaks the callback chain)
const protectAdminOrClient = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. No token." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "client") {
      return protectClient(req, res, next);
    }
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

// Public
router.get("/roi", getROISettings);
router.post("/leads", submitBuy2SellLead);

// Shared
router.get(
  "/leads/:id/documents/:docType",
  protectAdminOrClient,
  downloadDocument,
);

// Client
router.get("/my", protectClient, getMyInvestments);

// Admin
router.put("/roi", protect, isAdmin, updateROISettings);
router.get("/leads", protect, isAdmin, getAllLeads);
router.get("/leads/:id", protect, isAdmin, getLeadById);
router.patch("/leads/:id/status", protect, isAdmin, updateLeadStatus);
router.post("/leads/:id/record-payment", protect, isAdmin, recordPayment);
router.patch("/leads/:id/mature", protect, isAdmin, markMatured);
router.post("/leads/:id/process-payout", protect, isAdmin, processPayout);

export default router;
