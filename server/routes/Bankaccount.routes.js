import express from "express";
import {
  getAllBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "../controllers/Bankaccount.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, isAdmin, getAllBankAccounts);
router.post("/", protect, isAdmin, createBankAccount);
router.put("/:id", protect, isAdmin, updateBankAccount);
router.delete("/:id", protect, isAdmin, deleteBankAccount);

export default router;
