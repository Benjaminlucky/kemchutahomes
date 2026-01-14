import "./config/env.js"; // 🚨 ENV LOADS FIRST

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import realtorRoutes from "./routes/realtor.routes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cloudinary from "./utils/cloudinary.config.js";

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDb"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/realtors", realtorRoutes);
app.use("/api/admin", adminRoutes);

const result = await cloudinary.api.ping();
console.log("Cloudinary:", result.status);

app.listen(process.env.PORT || 3000, () => console.log("Server is running"));
