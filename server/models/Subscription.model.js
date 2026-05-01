import mongoose from "mongoose";

// ── Payment record sub-schema ─────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    paidAt: { type: Date, required: true },
    method: { type: String, default: "Bank Transfer" },
    reference: { type: String, default: "" },
    note: { type: String, default: "" },
    recordedBy: { type: String, default: "admin" },
    // Two-step confirmation — payment is logged then separately confirmed before receipt
    confirmed: { type: Boolean, default: false },
    confirmedBy: { type: String, default: "" },
    confirmedAt: { type: Date, default: null },
  },
  { _id: true, timestamps: true },
);

// ── Document record sub-schema ────────────────────────────────────────────────
const documentSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // "acknowledgement" | "contract" | "invoice" | "receipt" | "allocation"
    label: { type: String, required: true }, // human-readable name
    url: { type: String, default: "" }, // Cloudinary or local URL
    generatedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

// ── Installment schedule entry sub-schema ─────────────────────────────────────
const installmentSchema = new mongoose.Schema(
  {
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    paymentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { _id: true },
);

// ── Main subscription schema ───────────────────────────────────────────────────
const subscriptionSchema = new mongoose.Schema(
  {
    // ── Reference ──────────────────────────────────────────────────────────
    referenceNumber: { type: String, unique: true, sparse: true }, // KHL-2025-00001

    // ── Estate ─────────────────────────────────────────────────────────────
    estateName: { type: String, required: true, trim: true },
    estateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estate",
      default: null,
    },

    // ── Realtor who made this sale (for commission calculation) ────────────
    realtorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Realtor",
      default: null,
    },

    // ── Personal ───────────────────────────────────────────────────────────
    title: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    maritalStatus: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    spouseFirstName: { type: String, default: "" },
    spouseLastName: { type: String, default: "" },
    nationality: { type: String, default: "Nigerian" },
    employerName: { type: String, default: "" },

    // ── Contact & Address ──────────────────────────────────────────────────
    residentialAddress: { type: String, required: true },
    cityTown: { type: String, required: true },
    lga: { type: String, required: true },
    state: { type: String, required: true },
    countryOfResidence: { type: String, default: "Nigeria" },
    phone: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },

    // ── Subscription details ───────────────────────────────────────────────
    plotType: {
      type: String,
      required: true,
      enum: ["Residential", "Commercial", "Investment"],
    },
    paymentPlan: {
      type: String,
      required: true,
      enum: ["Outright", "6 Months Installment"],
    },
    numberOfPlots: { type: Number, required: true, min: 1 },
    plotSize: {
      type: String,
      required: true,
      enum: ["500sqm", "300sqm", "Corner Piece"],
    },
    surveyType: { type: String, required: true },
    totalAmount: { type: Number, required: true },

    // ── Payment tracking ───────────────────────────────────────────────────
    amountPaid: { type: Number, default: 0 },
    payments: { type: [paymentSchema], default: [] },
    installmentSchedule: { type: [installmentSchema], default: [] }, // only for 6-month plan

    // ── Allocation ─────────────────────────────────────────────────────────
    plotNumber: { type: String, default: "" }, // assigned by admin e.g. "Block A, Plot 14"
    allocationDate: { type: Date, default: null },
    titleDocument: { type: String, default: "" }, // C of O / Gazette etc.

    // ── Documents ──────────────────────────────────────────────────────────
    documents: { type: [documentSchema], default: [] },

    // ── Next of kin ────────────────────────────────────────────────────────
    kinFirstName: { type: String, required: true },
    kinLastName: { type: String, required: true },
    kinAddress: { type: String, required: true },
    kinCity: { type: String, default: "" },
    kinLga: { type: String, default: "" },
    kinPhone: { type: String, required: true },

    // ── Status ─────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending",
        "reviewed",
        "approved",
        "rejected",
        "payment_confirmed",
        "allocated",
      ],
      default: "pending",
    },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
subscriptionSchema.index({ email: 1 });
subscriptionSchema.index({ status: 1, createdAt: -1 });
subscriptionSchema.index({ referenceNumber: 1 });

// ── Virtual: balance remaining ─────────────────────────────────────────────
subscriptionSchema.virtual("balanceRemaining").get(function () {
  return Math.max(0, this.totalAmount - this.amountPaid);
});

// ── Virtual: payment progress percent ─────────────────────────────────────
subscriptionSchema.virtual("paymentProgressPercent").get(function () {
  if (!this.totalAmount) return 0;
  return Math.min(100, Math.round((this.amountPaid / this.totalAmount) * 100));
});

subscriptionSchema.set("toJSON", { virtuals: true });
subscriptionSchema.set("toObject", { virtuals: true });

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
