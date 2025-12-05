import express from "express";
import { loginAdmin, signupAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/signup", signupAdmin);
router.post("/login", loginAdmin);

export default router;
