import express from "express";
import {
  getROISettings,
  updateROISettings,
  submitBuy2SellLead,
  getAllLeads,
  updateLeadStatus,
  confirmPrincipal,
  processPayout,
  downloadDocument,
  getMyInvestments,
} from "../controllers/buy2sell.controller.js";
import {
  protect,
  isAdmin,
  protectClient,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/roi", getROISettings); // frontend reads live ROI rates
router.post("/leads", submitBuy2SellLead); // form submission

// ── Client portal ─────────────────────────────────────────────────────────────
router.get("/my", protectClient, getMyInvestments);
router.get("/leads/:id/documents/:docType", protectClient, downloadDocument);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.put("/roi", protect, isAdmin, updateROISettings);
router.get("/leads", protect, isAdmin, getAllLeads);
router.patch("/leads/:id/status", protect, isAdmin, updateLeadStatus);
router.post("/leads/:id/confirm-principal", protect, isAdmin, confirmPrincipal); // confirms payment received → Certificate + Agreement PDFs
router.post("/leads/:id/process-payout", protect, isAdmin, processPayout); // maturity payout → Payout Confirmation PDF
router.get("/leads/:id/documents/:docType", protect, isAdmin, downloadDocument);

export default router;
