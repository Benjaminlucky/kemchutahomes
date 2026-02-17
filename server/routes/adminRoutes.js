import express from "express";
import {
  forgotAdminPassword,
  loginAdmin,
  resetAdminPassword,
  signupAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/signup", signupAdmin);
router.post("/login", loginAdmin);
router.post("/forgot-password", forgotAdminPassword);
router.post("/reset-password", resetAdminPassword);
export default router;
