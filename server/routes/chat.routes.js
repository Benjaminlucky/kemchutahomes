import express from "express";
import { handleChat } from "../controllers/chat.controller.js";

const router = express.Router();

// POST /api/chat  — public, no auth required
router.post("/", handleChat);

export default router;
