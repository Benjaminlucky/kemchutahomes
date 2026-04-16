import "./config/env.js";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import realtorRoutes from "./routes/realtor.routes.js";
import adminRoutes from "./routes/adminRoutes.js";
import estateRoutes from "./routes/estate.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import inspectionRoutes from "./routes/inspection.routes.js";
import clientRoutes from "./routes/client.routes.js";
import cloudinary from "./utils/cloudinary.config.js";

const app = express();

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

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/realtors", realtorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/estates", estateRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/clients", clientRoutes);

const result = await cloudinary.api.ping();
console.log("Cloudinary:", result.status);

app.listen(process.env.PORT || 3000, () =>
  console.log("Server is running on port", process.env.PORT || 3000),
);
