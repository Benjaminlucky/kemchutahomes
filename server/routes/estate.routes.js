import express from "express";
import {
  getAllEstates,
  getEstateBySlug,
  getEstateById,
  createEstate,
  updateEstate,
  deleteEstate,
  deleteGalleryImage,
  toggleEstateStatus,
} from "../controllers/estate.controller.js";

import { isAdmin, protect } from "../middlewares/authMiddleware.js";
import { uploadEstateImages } from "../middlewares/upload.middleware.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllEstates);
router.get("/slug/:slug", getEstateBySlug);
router.get("/id/:id", getEstateById);

// ── Admin-protected ───────────────────────────────────────────────────────────
router.post("/", protect, isAdmin, uploadEstateImages, createEstate);
router.put("/:id", protect, isAdmin, uploadEstateImages, updateEstate);
router.delete("/:id", protect, isAdmin, deleteEstate);
router.delete("/:id/gallery/:publicId", protect, isAdmin, deleteGalleryImage);
router.patch("/:id/toggle", protect, isAdmin, toggleEstateStatus);

export default router;
