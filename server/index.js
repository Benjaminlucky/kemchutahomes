import "./config/env.js";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// ── Route imports ──────────────────────────────────────────────────────────────
import realtorRoutes from "./routes/realtor.routes.js";
import adminRoutes from "./routes/adminRoutes.js";
import estateRoutes from "./routes/estate.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import inspectionRoutes from "./routes/inspection.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import buy2sellRoutes from "./routes/buy2sell.routes.js";
import branchRoutes from "./routes/branch.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import clientRoutes from "./routes/client.routes.js";
import commissionRoutes from "./routes/commission.routes.js"; // ← NEW

// ── Scheduler ─────────────────────────────────────────────────────────────────
import { startScheduler } from "./utils/followUp.js";

// ── Utilities ─────────────────────────────────────────────────────────────────
import cloudinary from "./utils/cloudinary.config.js";

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://kemchutahomes.netlify.app",
  "https://kemchutahomesltd.com",
  "https://www.kemchutahomesltd.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json());

// ── MongoDB + scheduler ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    startScheduler(); // cron jobs — inspection reminders, follow-ups, payment reminders
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/realtors", realtorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", analyticsRoutes);
app.use("/api/estates", estateRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/buy2sell", buy2sellRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/commissions", commissionRoutes); // ← NEW

// ── Cloudinary health check ───────────────────────────────────────────────────
const result = await cloudinary.api.ping();
console.log("Cloudinary:", result.status);

// ── Server ────────────────────────────────────────────────────────────────────
app.listen(process.env.PORT || 3000, () =>
  console.log("Server is running on port", process.env.PORT || 3000),
);
