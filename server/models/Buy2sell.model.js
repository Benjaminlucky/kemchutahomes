import mongoose from "mongoose";

// ── ROI Settings singleton ────────────────────────────────────────────────────
const roiSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "global", unique: true },
    roiPercent6Months: { type: Number, required: true, default: 22 },
    roiPercent1Year: { type: Number, required: true, default: 48 },
    roiPercent18Months: { type: Number, required: true, default: 75 },
    minInvestment: { type: Number, default: 500000 },
    description: { type: String, default: "" },
    updatedBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

const b2sPaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    paidAt: { type: Date, required: true },
    method: { type: String, default: "Bank Transfer" },
    reference: { type: String, default: "" },
    note: { type: String, default: "" },
    type: { type: String, enum: ["principal", "payout"], default: "principal" },
  },
  { _id: true, timestamps: true },
);

const b2sDocSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, default: "" },
    generatedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const buy2SellLeadSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, unique: true, sparse: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    duration: {
      type: String,
      enum: ["6 Months", "1 Year", "18 Months"],
      default: "1 Year",
    },
    principalAmount: { type: Number, default: 0 },
    roiPercent: { type: Number },
    expectedROI: { type: Number, default: 0 },
    expectedPayout: { type: Number, default: 0 },
    investmentDate: { type: Date, default: null },
    maturityDate: { type: Date, default: null },
    actualPayout: { type: Number, default: 0 },
    payoutDate: { type: Date, default: null },
    payments: { type: [b2sPaymentSchema], default: [] },
    documents: { type: [b2sDocSchema], default: [] },
    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "approved",
        "active",
        "matured",
        "paid_out",
        "closed",
      ],
      default: "new",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

buy2SellLeadSchema.index({ email: 1 });
buy2SellLeadSchema.index({ status: 1, createdAt: -1 });
buy2SellLeadSchema.index({ maturityDate: 1, status: 1 });

export const ROISettings =
  mongoose.models.ROISettings ||
  mongoose.model("ROISettings", roiSettingsSchema);

export const Buy2SellLead =
  mongoose.models.Buy2SellLead ||
  mongoose.model("Buy2SellLead", buy2SellLeadSchema);
