import Subscription from "../models/Subscription.model.js";
import {
  notifySubscriptionSubmitted,
  notifySubscriptionStatusChanged,
} from "../utils/notifications.js";

// ── POST /api/subscriptions ──────────────────────────────────────────────────
export const createSubscription = async (req, res) => {
  try {
    const sub = await Subscription.create(req.body);

    // Fire multi-channel notifications (email + WhatsApp + SMS) — fire-and-forget
    // FIX: Previously called sendSubscriptionEmail which was defined AFTER the
    // call site using a dynamic import("resend") pattern — now uses the shared
    // notifications utility which is imported at the top of this file correctly.
    notifySubscriptionSubmitted(sub).catch((err) =>
      console.error("Subscription notification failed:", err.message),
    );

    res.status(201).json({
      message: "Subscription submitted successfully!",
      subscription: sub,
    });
  } catch (err) {
    console.error("createSubscription:", err);
    res
      .status(500)
      .json({ message: err.message || "Failed to submit subscription." });
  }
};

// ── GET /api/subscriptions — Admin ───────────────────────────────────────────
export const getAllSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, plotType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (plotType) filter.plotType = plotType;
    if (search) {
      filter.$or = [
        { estateName: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Subscription.countDocuments(filter),
    ]);
    res.json({
      subscriptions,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subscriptions." });
  }
};

// ── PATCH /api/subscriptions/:id/status ─────────────────────────────────────
export const updateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["pending", "reviewed", "approved", "rejected"];
    if (!valid.includes(status))
      return res.status(400).json({ message: "Invalid status." });

    const sub = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!sub)
      return res.status(404).json({ message: "Subscription not found." });

    // Notify client of status change via all channels — fire-and-forget
    notifySubscriptionStatusChanged(sub).catch((err) =>
      console.error("Subscription status notification failed:", err.message),
    );

    res.json({ message: "Status updated.", subscription: sub });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status." });
  }
};
