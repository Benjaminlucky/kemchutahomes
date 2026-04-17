import mongoose from "mongoose";

// ── ROI Settings (single document, updated by admin) ─────────────────────────
const roiSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "global", unique: true }, // only one doc
    roiPercent6Months: { type: Number, required: true, default: 35 }, // %
    roiPercent1Year: { type: Number, required: true, default: 65 },
    roiPercent18Months: { type: Number, required: true, default: 100 },
    minInvestment: { type: Number, default: 500000 }, // NGN
    description: { type: String, default: "" }, // admin notes
    updatedBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

// ── Lead submission ───────────────────────────────────────────────────────────
const buy2SellLeadSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    duration: {
      type: String,
      enum: ["6 Months", "1 Year", "18 Months"],
      default: "1 Year",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "converted", "closed"],
      default: "new",
    },
    notes: { type: String, default: "" },
    // snapshot of ROI at time of submission
    roiPercent: { type: Number },
  },
  { timestamps: true },
);

buy2SellLeadSchema.index({ email: 1 });
buy2SellLeadSchema.index({ status: 1, createdAt: -1 });

export const ROISettings =
  mongoose.models.ROISettings ||
  mongoose.model("ROISettings", roiSettingsSchema);

export const Buy2SellLead =
  mongoose.models.Buy2SellLead ||
  mongoose.model("Buy2SellLead", buy2SellLeadSchema);
