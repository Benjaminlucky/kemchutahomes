import Realtor from "../models/realtor.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.config.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../utils/email.js";
import crypto from "crypto";

/* -------------------------------- HELPERS -------------------------------- */

const generateReferralCode = async () => {
  let code,
    exists = true;
  while (exists) {
    const count = await Realtor.countDocuments();
    const rand = Math.floor(10 + Math.random() * 90);
    code = `kem${String(count + 1).padStart(3, "0")}${rand}`;
    exists = await Realtor.exists({ referralCode: code });
  }
  return code;
};

/* -------------------------------- AUTH -------------------------------- */

export const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      state,
      bank,
      accountName,
      accountNumber,
      password,
      ref,
      birthDate,
      avatar,
    } = req.body;

    if (await Realtor.findOne({ email })) {
      return res.status(400).json({ message: "Email already registered" });
    }

    let recruiter = null;
    if (ref?.trim()) {
      recruiter = await Realtor.findOne({ referralCode: ref.trim() });
      if (!recruiter) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await generateReferralCode();

    const realtor = await Realtor.create({
      firstName,
      lastName,
      email,
      phone,
      state,
      bank,
      accountName,
      accountNumber,
      avatar: avatar || undefined,
      passwordHash,
      referralCode,
      birthDate: new Date(birthDate),
      recruitedBy: recruiter?._id || null,
    });

    sendWelcomeEmail({
      email: realtor.email,
      firstName: realtor.firstName,
    }).catch(() => null);

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: realtor._id,
        name: `${realtor.firstName} ${realtor.lastName}`,
        referralCode: realtor.referralCode,
        referralLink: realtor.referralLink,
      },
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const realtor = await Realtor.findOne({ email });
    if (!realtor) return res.status(404).json({ message: "Realtor not found" });

    const isMatch = await bcrypt.compare(password, realtor.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: realtor._id, role: realtor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: realtor._id,
        firstName: realtor.firstName,
        lastName: realtor.lastName,
        email: realtor.email,
        role: realtor.role,
        avatar: realtor.avatar,
        referralCode: realtor.referralCode,
        referralLink: realtor.referralLink,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* ------------------------------ DASHBOARD -------------------------------- */

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const realtor = await Realtor.findById(userId)
      .populate("recruitedBy", "firstName lastName role")
      .exec();

    if (!realtor) {
      return res.status(404).json({ message: "User not found" });
    }

    const realtorObj = realtor.toObject({ virtuals: true });
    const recruitCount = await Realtor.countDocuments({ recruitedBy: userId });

    // Determine recruited by label
    let recruitedByLabel = "Admin"; // Default to Admin if no recruiter

    if (realtorObj.recruitedBy && typeof realtorObj.recruitedBy === "object") {
      // If recruited by admin, show "Admin"
      if (realtorObj.recruitedBy.role === "admin") {
        recruitedByLabel = "Admin";
      } else {
        // If recruited by a realtor, show realtor's full name
        recruitedByLabel = `${realtorObj.recruitedBy.firstName} ${realtorObj.recruitedBy.lastName}`;
      }
    }

    return res.json({
      firstName: realtorObj.firstName,
      lastName: realtorObj.lastName,
      name: `${realtorObj.firstName} ${realtorObj.lastName}`,
      avatar: realtorObj.avatar || null,
      downlines: recruitCount,
      recruitedBy: recruitedByLabel,
      referralCode: realtorObj.referralCode,
      referralLink: realtorObj.referralLink,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ------------------------------ MY RECRUITS -------------------------------- */

export const getMyRecruits = async (req, res) => {
  try {
    const userId = req.user.id;

    const recruits = await Realtor.find({ recruitedBy: userId })
      .select("firstName lastName email phone avatar referralCode createdAt")
      .sort("-createdAt")
      .lean();

    return res.json({
      recruits,
      total: recruits.length,
    });
  } catch (error) {
    console.error("Get My Recruits Error:", error);
    res.status(500).json({ message: "Failed to fetch recruits" });
  }
};

/* ------------------------------ PROFILE -------------------------------- */

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const uploadFromBuffer = (buffer) =>
      new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "kemchuta/avatars",
              transformation: { width: 400, height: 400, crop: "fill" },
            },
            (err, result) => (err ? reject(err) : resolve(result)),
          )
          .end(buffer);
      });

    const result = await uploadFromBuffer(req.file.buffer);

    const updated = await Realtor.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true },
    ).select("firstName lastName avatar referralCode email role");

    return res.json({
      message: "Avatar updated",
      avatar: result.secure_url,
      user: {
        id: updated._id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: updated.role,
        avatar: updated.avatar,
        referralCode: updated.referralCode,
      },
    });
  } catch (err) {
    console.error("AVATAR UPLOAD ERROR:", err);
    return res.status(500).json({ message: "Avatar upload failed" });
  }
};

/* ------------------------------ ADMIN -------------------------------- */

export const getRealtors = async (req, res) => {
  try {
    const page = Math.max(+req.query.page || 1, 1);
    const limit = Math.min(+req.query.limit || 10, 100);
    const search = req.query.search || "";

    const filter = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { referralCode: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await Realtor.countDocuments(filter);

    const realtors = await Realtor.find(filter)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("recruitedBy", "firstName lastName referralCode")
      .lean();

    const docs = realtors.map((r) => ({
      ...r,
      name: `${r.firstName} ${r.lastName}`,
      recruitedByName: r.recruitedBy
        ? `${r.recruitedBy.firstName} ${r.recruitedBy.lastName}`
        : null,
    }));

    return res.json({
      docs,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET REALTORS ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch realtors" });
  }
};

export const getRealtorById = async (req, res) => {
  try {
    const realtor = await Realtor.findById(req.params.id)
      .populate("recruitedBy", "firstName lastName referralCode")
      .select("-passwordHash");

    if (!realtor) return res.status(404).json({ message: "Realtor not found" });
    res.json(realtor);
  } catch (err) {
    console.error("GET REALTOR ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateRealtor = async (req, res) => {
  try {
    const updated = await Realtor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!updated) return res.status(404).json({ message: "Realtor not found" });
    res.json({ message: "Updated successfully", realtor: updated });
  } catch (err) {
    console.error("UPDATE REALTOR ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteRealtor = async (req, res) => {
  try {
    const recruits = await Realtor.countDocuments({
      recruitedBy: req.params.id,
    });
    if (recruits > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete realtor with recruits" });
    }

    await Realtor.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE REALTOR ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ─────────────────────────── FORGOT PASSWORD ─────────────────────────────── */

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const realtor = await Realtor.findOne({
      email: email.toLowerCase().trim(),
    });

    // Always return 200 — prevents email enumeration
    if (!realtor) {
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    realtor.resetPasswordToken = hashedToken;
    realtor.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await realtor.save({ validateBeforeSave: false });

    const FRONTEND_URL =
      process.env.FRONTEND_URL || "https://kemchutahomes.netlify.app";
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}`;

    sendPasswordResetEmail({
      email: realtor.email,
      firstName: realtor.firstName,
      resetUrl,
    }).catch(async () => {
      realtor.resetPasswordToken = undefined;
      realtor.resetPasswordExpiry = undefined;
      await realtor.save({ validateBeforeSave: false }).catch(() => null);
    });

    return res.status(200).json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

/* ─────────────────────────── RESET PASSWORD ──────────────────────────────── */

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const realtor = await Realtor.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!realtor) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired." });
    }

    realtor.passwordHash = await bcrypt.hash(password, 12);
    realtor.resetPasswordToken = undefined;
    realtor.resetPasswordExpiry = undefined;
    await realtor.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
