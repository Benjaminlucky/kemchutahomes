import express from "express";
import {
  registerClient,
  loginClient,
  getClientDashboard,
  getClientSubscriptions,
  getClientInspections,
  getClientProfile,
  forgotClientPassword,
  resetClientPassword,
  getAllClients,
} from "../controllers/client.controller.js";
import { protectClient, protectAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.post("/register", registerClient);
router.post("/login", loginClient);
router.post("/forgot-password", forgotClientPassword);
router.post("/reset-password", resetClientPassword);

// ── Client-protected routes ───────────────────────────────────────────────────
router.get("/dashboard", protectClient, getClientDashboard);
router.get("/subscriptions", protectClient, getClientSubscriptions);
router.get("/inspections", protectClient, getClientInspections);
router.get("/profile", protectClient, getClientProfile);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get("/", protectAdmin, getAllClients);

export default router;
