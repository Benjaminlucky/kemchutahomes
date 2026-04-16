import Client from "../models/client.model.js";
import Subscription from "../models/Subscription.model.js";
import Inspection from "../models/inspection.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendClientWelcomeEmail,
  sendClientPasswordResetEmail,
} from "../utils/email.js";

/* ──────────────────────────── HELPERS ──────────────────────────────────── */

const generateToken = (client) =>
  jwt.sign({ id: client._id, role: "client" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

/* ──────────────────────────── AUTH ─────────────────────────────────────── */

export const registerClient = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (await Client.findOne({ email: email.toLowerCase().trim() })) {
      return res.status(400).json({ message: "Email already registered" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const client = await Client.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
    });

    // Fire-and-forget welcome email — mirrors realtor pattern
    sendClientWelcomeEmail({
      email: client.email,
      firstName: client.firstName,
    }).catch(() => null);

    const token = generateToken(client);

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        role: client.role,
        avatar: client.avatar,
      },
    });
  } catch (err) {
    console.error("CLIENT REGISTER ERROR:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const client = await Client.findOne({ email: email.toLowerCase().trim() });
    if (!client) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    if (!client.isActive) {
      return res
        .status(403)
        .json({ message: "Account suspended. Contact support." });
    }

    const isMatch = await bcrypt.compare(password, client.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(client);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        role: client.role,
        avatar: client.avatar,
      },
    });
  } catch (err) {
    console.error("CLIENT LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* ──────────────────────────── DASHBOARD DATA ───────────────────────────── */

export const getClientDashboard = async (req, res) => {
  try {
    const clientId = req.user.id;

    const client = await Client.findById(clientId)
      .select("-passwordHash -resetPasswordToken -resetPasswordExpiry")
      .lean();

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Fetch subscriptions linked to this client's email
    const subscriptions = await Subscription.find({ email: client.email })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch inspections linked to this client's email
    const inspections = await Inspection.find({ email: client.email })
      .sort({ inspectionDate: -1 })
      .lean();

    // Compute summary stats
    const totalSubscriptions = subscriptions.length;
    const approvedSubscriptions = subscriptions.filter(
      (s) => s.status === "approved",
    ).length;
    const pendingSubscriptions = subscriptions.filter(
      (s) => s.status === "pending",
    ).length;
    const totalInspections = inspections.length;
    const upcomingInspections = inspections.filter(
      (i) =>
        i.status !== "cancelled" && new Date(i.inspectionDate) >= new Date(),
    ).length;

    return res.json({
      client,
      stats: {
        totalSubscriptions,
        approvedSubscriptions,
        pendingSubscriptions,
        totalInspections,
        upcomingInspections,
      },
      recentSubscriptions: subscriptions.slice(0, 5),
      recentInspections: inspections.slice(0, 5),
    });
  } catch (err) {
    console.error("CLIENT DASHBOARD ERROR:", err);
    return res.status(500).json({ message: "Failed to load dashboard" });
  }
};

export const getClientSubscriptions = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id).select("email").lean();
    if (!client) return res.status(404).json({ message: "Client not found" });

    const { page = 1, limit = 10, status } = req.query;
    const filter = { email: client.email };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Subscription.countDocuments(filter),
    ]);

    return res.json({
      subscriptions,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("CLIENT SUBSCRIPTIONS ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
};

export const getClientInspections = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id).select("email").lean();
    if (!client) return res.status(404).json({ message: "Client not found" });

    const { page = 1, limit = 10, status } = req.query;
    const filter = { email: client.email };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [inspections, total] = await Promise.all([
      Inspection.find(filter)
        .sort({ inspectionDate: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Inspection.countDocuments(filter),
    ]);

    return res.json({
      inspections,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("CLIENT INSPECTIONS ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch inspections" });
  }
};

export const getClientProfile = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id)
      .select("-passwordHash -resetPasswordToken -resetPasswordExpiry")
      .lean();
    if (!client) return res.status(404).json({ message: "Client not found" });
    return res.json(client);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* ──────────────────────────── FORGOT PASSWORD ──────────────────────────── */

export const forgotClientPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const client = await Client.findOne({ email: email.toLowerCase().trim() });

    // Always 200 — prevents email enumeration (mirrors realtor pattern)
    if (!client) {
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    client.resetPasswordToken = hashedToken;
    client.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await client.save({ validateBeforeSave: false });

    const FRONTEND_URL =
      process.env.FRONTEND_URL || "https://kemchutahomesltd.com";
    const resetUrl = `${FRONTEND_URL}/client/reset-password?token=${rawToken}`;

    sendClientPasswordResetEmail({
      email: client.email,
      firstName: client.firstName,
      resetUrl,
    }).catch(async () => {
      client.resetPasswordToken = undefined;
      client.resetPasswordExpiry = undefined;
      await client.save({ validateBeforeSave: false }).catch(() => null);
    });

    return res.status(200).json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("CLIENT FORGOT PASSWORD ERROR:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

/* ──────────────────────────── RESET PASSWORD ───────────────────────────── */

export const resetClientPassword = async (req, res) => {
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

    const client = await Client.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!client) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired." });
    }

    client.passwordHash = await bcrypt.hash(password, 12);
    client.resetPasswordToken = undefined;
    client.resetPasswordExpiry = undefined;
    await client.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("CLIENT RESET PASSWORD ERROR:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

/* ──────────────────────────── ADMIN: LIST CLIENTS ──────────────────────── */

export const getAllClients = async (req, res) => {
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
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await Client.countDocuments(filter);
    const clients = await Client.find(filter)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-passwordHash -resetPasswordToken -resetPasswordExpiry")
      .lean();

    return res.json({
      docs: clients,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET ALL CLIENTS ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch clients" });
  }
};
