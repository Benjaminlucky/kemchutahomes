import express from "express";
import {
  registerClient,
  loginClient,
  getClientProfile,
  getClientDashboard,
  forgotPassword,
  resetPassword,
  checkEmailExists,
  getClientInspections,
} from "../controllers/client.controller.js";
import { protectClient } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── Public ─────────────────────────────────────────────────────────────────
router.post("/register", registerClient);
router.post("/login", loginClient);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/check-email", checkEmailExists);

// ── Protected (client token) ───────────────────────────────────────────────
router.get("/me", protectClient, getClientProfile);
router.get("/dashboard", protectClient, getClientDashboard);
router.get("/inspections", protectClient, getClientInspections);

export default router;
