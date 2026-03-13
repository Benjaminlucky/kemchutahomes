import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    estateName: { type: String, required: true, trim: true },
    estateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estate",
      default: null,
    },
    // Personal
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
    // Contact & Address
    residentialAddress: { type: String, required: true },
    cityTown: { type: String, required: true },
    lga: { type: String, required: true },
    state: { type: String, required: true },
    countryOfResidence: { type: String, default: "Nigeria" },
    phone: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    // Subscription
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
    // Next of kin
    kinFirstName: { type: String, required: true },
    kinLastName: { type: String, required: true },
    kinAddress: { type: String, required: true },
    kinCity: { type: String, default: "" },
    kinLga: { type: String, default: "" },
    kinPhone: { type: String, required: true },
    // Status
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

subscriptionSchema.index({ email: 1 });
subscriptionSchema.index({ status: 1, createdAt: -1 });

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
