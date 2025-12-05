// controllers/auth.controller.js
import Realtor from "../models/realtor.model.js";
import bcrypt from "bcrypt";
import cloudinary from "../utils/cloudinary.config.js";
import streamifier from "streamifier";

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

    const passwordHash = await bcrypt.hash(password, 12);

    let recruiter = null;
    if (ref?.trim()) {
      recruiter = await Realtor.findOne({ referralCode: ref.trim() });
      if (!recruiter) {
        return res
          .status(400)
          .json({ message: "Invalid referral code provided" });
      }
    }

    const count = await Realtor.countDocuments();
    const referralCode = `kem${String(count + 1).padStart(3, "0")}`;

    const newRealtor = await Realtor.create({
      firstName,
      lastName,
      email,
      phone,
      state,
      bank,
      accountName,
      accountNumber,
      avatar: avatar || undefined, // ✅ allow override
      passwordHash,
      referralCode,
      birthDate: new Date(birthDate),
      recruitedBy: recruiter?._id || null,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newRealtor._id,
        name: `${newRealtor.firstName} ${newRealtor.lastName}`,
        avatar: newRealtor.avatar,
        referralCode: newRealtor.referralCode,
        referralLink: newRealtor.referralLink,
      },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ message: "Unable to create Realtor Account" });
  }
};

// Update avatar controller
export const updateAvatar = async (req, res) => {
  try {
    // multer has put the file buffer on req.file
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;

    // Upload buffer to Cloudinary via upload_stream
    const uploadFromBuffer = (buffer) =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "kemchuta/avatars",
            transformation: { width: 800, crop: "limit" },
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });

    const result = await uploadFromBuffer(req.file.buffer);

    // Save avatar URL on Realtor
    const updated = await Realtor.findByIdAndUpdate(
      userId,
      { avatar: result.secure_url },
      { new: true, runValidators: true }
    ).select("firstName lastName avatar referralCode");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Avatar updated",
      avatar: updated.avatar,
      user: {
        id: updated._id,
        name: `${updated.firstName} ${updated.lastName}`,
        avatar: updated.avatar,
        referralCode: updated.referralCode,
      },
    });
  } catch (error) {
    console.error("updateAvatar error:", error);
    return res.status(500).json({ message: "Failed to upload avatar" });
  }
};

export const getRealtors = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      100
    );
    const sort = req.query.sort || "-createdAt";
    const search = req.query.search || "";

    // Filter by search
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { referralCode: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Realtor.countDocuments(filter);
    const pages = Math.max(Math.ceil(total / limit), 1);
    const skip = (page - 1) * limit;

    const docs = await Realtor.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("recruitedBy", "firstName lastName referralCode") // ✅ populate recruiter
      .select(
        "firstName lastName email phone referralCode createdAt recruitedBy bank accountName accountNumber"
      )

      .lean();

    const formatted = docs.map((d) => ({
      _id: d._id,
      referralCode: d.referralCode,
      name: `${d.firstName} ${d.lastName}`,
      email: d.email,
      phone: d.phone,
      accountNumber: d.accountNumber || null, // ✅ Add this line
      accountName: d.accountName || null, // (optional)
      bank: d.bank || null, // (optional)

      createdAt: d.createdAt,
      recruitedByName: d.recruitedBy
        ? `${d.recruitedBy.firstName} ${d.recruitedBy.lastName}`
        : "-",
      recruitedByCode: d.recruitedBy ? d.recruitedBy.referralCode : "-",
    }));

    return res.json({
      docs: formatted,
      total,
      page,
      pages,
      limit,
    });
  } catch (err) {
    console.error("getRealtors error:", err);
    return res.status(500).json({ message: "Failed to fetch realtors" });
  }
};

// Add these to your realtor.controller.js file

// Get single realtor by ID
export const getRealtorById = async (req, res) => {
  try {
    const { id } = req.params;

    const realtor = await Realtor.findById(id)
      .populate("recruitedBy", "firstName lastName referralCode")
      .select("-passwordHash")
      .lean();

    if (!realtor) {
      return res.status(404).json({ message: "Realtor not found" });
    }

    // Format response
    const formatted = {
      ...realtor,
      recruitedByName: realtor.recruitedBy
        ? `${realtor.recruitedBy.firstName} ${realtor.recruitedBy.lastName}`
        : null,
      recruitedByCode: realtor.recruitedBy
        ? realtor.recruitedBy.referralCode
        : null,
    };

    return res.json(formatted);
  } catch (err) {
    console.error("getRealtorById error:", err);
    return res.status(500).json({ message: "Failed to fetch realtor" });
  }
};

// Update realtor by ID
export const updateRealtor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      state,
      bank,
      accountName,
      accountNumber,
      birthDate,
    } = req.body;

    // Check if realtor exists
    const existing = await Realtor.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Realtor not found" });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== existing.email) {
      const emailExists = await Realtor.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update fields
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (state) updateData.state = state;
    if (bank) updateData.bank = bank;
    if (accountName) updateData.accountName = accountName;
    if (accountNumber) updateData.accountNumber = accountNumber;
    if (birthDate) updateData.birthDate = new Date(birthDate);

    const updated = await Realtor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("recruitedBy", "firstName lastName referralCode")
      .select("-passwordHash")
      .lean();

    const formatted = {
      ...updated,
      recruitedByName: updated.recruitedBy
        ? `${updated.recruitedBy.firstName} ${updated.recruitedBy.lastName}`
        : null,
    };

    return res.json({
      message: "Realtor updated successfully",
      realtor: formatted,
    });
  } catch (err) {
    console.error("updateRealtor error:", err);
    return res.status(500).json({ message: "Failed to update realtor" });
  }
};

// Delete realtor by ID
export const deleteRealtor = async (req, res) => {
  try {
    const { id } = req.params;

    const realtor = await Realtor.findById(id);
    if (!realtor) {
      return res.status(404).json({ message: "Realtor not found" });
    }

    // Check if realtor has recruited others
    const recruitsCount = await Realtor.countDocuments({ recruitedBy: id });

    if (recruitsCount > 0) {
      // Option 1: Prevent deletion
      return res.status(400).json({
        message: `Cannot delete realtor with ${recruitsCount} recruits. Please reassign or remove recruits first.`,
      });

      // Option 2: Set recruits' recruitedBy to null (uncomment if preferred)
      // await Realtor.updateMany(
      //   { recruitedBy: id },
      //   { $set: { recruitedBy: null } }
      // );
    }

    await Realtor.findByIdAndDelete(id);

    return res.json({
      message: "Realtor deleted successfully",
      id,
    });
  } catch (err) {
    console.error("deleteRealtor error:", err);
    return res.status(500).json({ message: "Failed to delete realtor" });
  }
};
