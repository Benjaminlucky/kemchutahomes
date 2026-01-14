import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: "admin" }, // ✅ include role
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

export const signupAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Admin already exists" });

    const admin = await Admin.create({ email, password });
    const token = generateToken(admin);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: "admin",
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(admin);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: "admin",
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: err.message });
  }
};
