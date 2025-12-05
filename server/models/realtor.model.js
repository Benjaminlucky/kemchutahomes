// models/realtor.model.js
import mongoose from "mongoose";

const RealtorSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: { type: String, required: true, trim: true },
  birthDate: { type: Date, required: true },
  state: { type: String },
  bank: { type: String },
  accountName: { type: String },
  accountNumber: { type: String },
  passwordHash: { type: String, required: true },

  // ✅ Better default avatar placeholder
  avatar: {
    type: String,
    default: "https://ui-avatars.com/api/?name=Realtor",
  },

  referralCode: { type: String, required: true, unique: true },

  // ✅ Correct model reference
  recruitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Realtor",
    default: null,
  },

  role: { type: String, enum: ["admin", "realtor"], default: "realtor" },

  createdAt: { type: Date, default: Date.now },
});

// ✅ Fix populate + referral counting
RealtorSchema.index({ recruitedBy: 1 });

RealtorSchema.virtual("referralLink").get(function () {
  return `https://pcrg.netlify.app/sign-up?ref=${this.referralCode}`;
});

RealtorSchema.virtual("recruitCount", {
  ref: "Realtor",
  localField: "_id",
  foreignField: "recruitedBy",
  count: true,
});

RealtorSchema.set("toJSON", { virtuals: true });
RealtorSchema.set("toObject", { virtuals: true });

export default mongoose.models.Realtor ||
  mongoose.model("Realtor", RealtorSchema);
