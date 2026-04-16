import mongoose from "mongoose";
import bcrypt from "bcrypt";

const clientSchema = new mongoose.Schema(
  {
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
    passwordHash: { type: String, required: true },

    // ── Password reset (mirrors realtor pattern exactly) ───────────────────
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },

    // ── Profile ───────────────────────────────────────────────────────────
    avatar: {
      type: String,
      default:
        "https://ui-avatars.com/api/?name=Client&background=700CEB&color=fff",
    },

    role: { type: String, default: "client", enum: ["client"] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Indexes
clientSchema.index({ email: 1 });
clientSchema.index({ createdAt: -1 });

export default mongoose.models.Client || mongoose.model("Client", clientSchema);
