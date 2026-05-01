import express from "express";
import { submitContactForm } from "../controllers/contact.controller.js";

const router = express.Router();

// POST /api/contact — public
router.post("/", submitContactForm);

export default router;
