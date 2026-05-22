import express from "express";
import {
  getKnowledgeBase,
  updateCompanyInfo,
  addFaq,
  updateFaq,
  deleteFaq,
  addNotice,
  deleteNotice,
} from "../controllers/knowledgeBase.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public — used by chat controller at runtime
router.get("/", getKnowledgeBase);

// Admin only
router.put("/company-info", protect, isAdmin, updateCompanyInfo);
router.post("/faqs", protect, isAdmin, addFaq);
router.put("/faqs/:faqId", protect, isAdmin, updateFaq);
router.delete("/faqs/:faqId", protect, isAdmin, deleteFaq);
router.post("/notices", protect, isAdmin, addNotice);
router.delete("/notices/:id", protect, isAdmin, deleteNotice);

export default router;
