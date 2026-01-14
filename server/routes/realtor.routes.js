import express from "express";
import {
  signup,
  login,
  updateAvatar,
  getRealtors,
  getRealtorById,
  updateRealtor,
  deleteRealtor,
} from "../controllers/realtor.controller.js";

import { protect } from "../middlewares/authMiddleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/", protect, getRealtors);
router.get("/:id", protect, getRealtorById);
router.put("/:id", protect, updateRealtor);
router.delete("/:id", protect, deleteRealtor);

router.put("/avatar", protect, uploadSingleImage, updateAvatar);

export default router;
