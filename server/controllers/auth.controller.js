import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Realtor from "../models/realtor.model.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find realtor by email
    const realtor = await Realtor.findOne({ email });
    if (!realtor) {
      return res.status(404).json({ message: "Realtor not found." });
    }

    // ✅ Compare password using bcrypt directly
    const isMatch = await bcrypt.compare(password, realtor.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: realtor._id, role: realtor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      realtor: {
        id: realtor._id,
        firstName: realtor.firstName,
        lastName: realtor.lastName,
        email: realtor.email,
        role: realtor.role,
        referralCode: realtor.referralCode,
        referralLink: realtor.referralLink, // ✅ Added
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
