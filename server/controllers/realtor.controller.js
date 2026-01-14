import Realtor from "../models/realtor.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.config.js";
import streamifier from "streamifier";
import { sendWelcomeEmail } from "../utils/email.js";

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

/**
 * POST /api/realtors/signup
 */
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

    // 🔔 Non-blocking welcome email
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

/**
 * POST /api/realtors/login
 */
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
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      realtor: {
        id: realtor._id,
        firstName: realtor.firstName,
        lastName: realtor.lastName,
        email: realtor.email,
        referralCode: realtor.referralCode,
        referralLink: realtor.referralLink,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
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
            (err, result) => (err ? reject(err) : resolve(result))
          )
          .end(buffer);
      });

    const result = await uploadFromBuffer(req.file.buffer);

    const updated = await Realtor.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select("firstName lastName avatar referralCode");

    return res.json({ message: "Avatar updated", user: updated });
  } catch (err) {
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
    const docs = await Realtor.find(filter)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("recruitedBy", "firstName lastName referralCode")
      .lean();

    return res.json({
      docs,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch {
    return res.status(500).json({ message: "Failed to fetch realtors" });
  }
};

export const getRealtorById = async (req, res) => {
  const realtor = await Realtor.findById(req.params.id)
    .populate("recruitedBy", "firstName lastName referralCode")
    .select("-passwordHash");

  if (!realtor) return res.status(404).json({ message: "Realtor not found" });
  res.json(realtor);
};

export const updateRealtor = async (req, res) => {
  const updated = await Realtor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");

  if (!updated) return res.status(404).json({ message: "Realtor not found" });
  res.json({ message: "Updated successfully", realtor: updated });
};

export const deleteRealtor = async (req, res) => {
  const recruits = await Realtor.countDocuments({ recruitedBy: req.params.id });
  if (recruits > 0) {
    return res
      .status(400)
      .json({ message: "Cannot delete realtor with recruits" });
  }

  await Realtor.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
};
