import jwt from "jsonwebtoken";
import Realtor from "../models/realtor.model.js";
import Admin from "../models/admin.js";

/**
 * Protect routes (Admin + Realtor)
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized. No token." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1️⃣ Try Admin first
    let user = await Admin.findById(decoded.id).select("_id email");

    if (user) {
      // ✅ Manually set role for admin since it's not in the schema
      req.user = {
        _id: user._id,
        id: user._id,
        email: user.email,
        role: "admin",
      };
      return next();
    }

    // 2️⃣ If not admin, try Realtor
    user = await Realtor.findById(decoded.id).select(
      "_id email role firstName lastName referralCode",
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      _id: user._id,
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      referralCode: user.referralCode,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

/**
 * Admin-only guard
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

/**
 * Admin protected routes
 */
export const protectAdmin = [protect, isAdmin];
