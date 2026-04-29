import { ROISettings, Buy2SellLead } from "../models/Buy2sell.model.js";
import { sendEmail } from "../utils/notifications.js";

const ADMIN_EMAIL = () =>
  process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "";

// ── GET /api/buy2sell/roi  (public — frontend reads this) ─────────────────────
export const getROISettings = async (req, res) => {
  try {
    let settings = await ROISettings.findOne({ singleton: "global" }).lean();
    if (!settings) {
      // seed defaults on first call
      settings = await ROISettings.create({ singleton: "global" });
    }
    res.json(settings);
  } catch (err) {
    console.error("getROISettings:", err);
    res.status(500).json({ message: "Failed to fetch ROI settings" });
  }
};

// ── PUT /api/buy2sell/roi  (admin only) ───────────────────────────────────────
export const updateROISettings = async (req, res) => {
  try {
    const {
      roiPercent6Months,
      roiPercent1Year,
      roiPercent18Months,
      minInvestment,
      description,
    } = req.body;

    const settings = await ROISettings.findOneAndUpdate(
      { singleton: "global" },
      {
        ...(roiPercent6Months !== undefined && {
          roiPercent6Months: Number(roiPercent6Months),
        }),
        ...(roiPercent1Year !== undefined && {
          roiPercent1Year: Number(roiPercent1Year),
        }),
        ...(roiPercent18Months !== undefined && {
          roiPercent18Months: Number(roiPercent18Months),
        }),
        ...(minInvestment !== undefined && {
          minInvestment: Number(minInvestment),
        }),
        ...(description !== undefined && { description }),
        updatedBy: req.user?.email || "admin",
      },
      { new: true, upsert: true },
    );

    res.json({ message: "ROI settings updated", settings });
  } catch (err) {
    console.error("updateROISettings:", err);
    res.status(500).json({ message: "Failed to update ROI settings" });
  }
};

// ── POST /api/buy2sell/leads  (public — form submission) ─────────────────────
export const submitBuy2SellLead = async (req, res) => {
  try {
    const { fullName, email, phone, duration } = req.body;

    if (!fullName?.trim() || !email?.trim() || !phone?.trim()) {
      return res
        .status(400)
        .json({ message: "Full name, email and phone are required" });
    }

    // Fetch current ROI to snapshot
    const roi = await ROISettings.findOne({ singleton: "global" }).lean();
    const roiMap = {
      "6 Months": roi?.roiPercent6Months ?? 35,
      "1 Year": roi?.roiPercent1Year ?? 65,
      "18 Months": roi?.roiPercent18Months ?? 100,
    };
    const roiPercent = roiMap[duration] ?? roiMap["1 Year"];

    const lead = await Buy2SellLead.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      duration: duration || "1 Year",
      roiPercent,
    });

    // Admin notification email
    sendEmail({
      to: ADMIN_EMAIL(),
      subject: `New Buy2Sell Lead — ${fullName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f9f9fb;border-radius:12px;">
          <div style="background:linear-gradient(135deg,#3F0C91,#700CEB);padding:28px 32px;border-radius:10px;margin-bottom:28px;">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">New Buy2Sell Enquiry</h1>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">Someone is interested in the land bank scheme</p>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            ${[
              ["Name", fullName],
              ["Email", email],
              ["Phone", phone],
              ["Duration", duration || "1 Year"],
              ["ROI Rate", `${roiPercent}%`],
            ]
              .map(
                ([l, v]) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#6b7280;font-weight:700;width:35%;">${l}</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#0f0a1e;font-weight:700;">${v}</td>
              </tr>`,
              )
              .join("")}
          </table>
          <div style="margin-top:24px;padding:14px 18px;background:rgba(112,12,235,0.06);border-radius:8px;border-left:3px solid #700CEB;">
            <p style="margin:0;font-size:13px;color:#700CEB;font-weight:600;">
              Please contact this lead within 24 hours to discuss investment details.
            </p>
          </div>
        </div>
      `,
    }).catch(() => null);

    // Client acknowledgment email
    sendEmail({
      to: email.trim(),
      subject: "Your Buy2Sell Enquiry — Kemchuta Homes",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f9f9fb;border-radius:12px;">
          <div style="background:linear-gradient(135deg,#3F0C91,#700CEB);padding:28px 32px;border-radius:10px;margin-bottom:28px;">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">Kemchuta Homes</h1>
            <span style="display:inline-block;background:rgba(255,255,255,0.2);color:#fff;font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;margin-top:10px;letter-spacing:1px;">BUY2SELL SCHEME</span>
          </div>
          <h2 style="font-size:20px;font-weight:700;color:#0f0a1e;margin-top:0;">Enquiry Received! 🎉</h2>
          <p style="color:#525252;font-size:15px;line-height:1.7;">
            Hi ${fullName}, thank you for your interest in the Kemchuta Homes Buy2Sell land bank scheme.
            Your enquiry for a <strong>${duration || "1 Year"}</strong> investment (ROI: <strong>${roiPercent}%</strong>) has been received.
          </p>
          <p style="color:#525252;font-size:15px;">
            Our investment team will contact you within <strong>24 hours</strong> to walk you through the process and answer any questions.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="https://kemchutahomesltd.com" style="background:#700CEB;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;">
              Explore Our Estates
            </a>
          </div>
          <p style="color:#525252;font-size:15px;margin-bottom:0;">Best Regards,</p>
          <p style="color:#700CEB;font-weight:700;font-size:15px;margin-top:0;">The Kemchuta Homes Investment Team</p>
        </div>
      `,
    }).catch(() => null);

    res.status(201).json({
      message:
        "Enquiry submitted successfully! We'll be in touch within 24 hours.",
      lead: { id: lead._id, fullName, email, phone, duration, roiPercent },
    });
  } catch (err) {
    console.error("submitBuy2SellLead:", err);
    res
      .status(500)
      .json({ message: "Failed to submit enquiry. Please try again." });
  }
};

// ── GET /api/buy2sell/leads  (admin only) ─────────────────────────────────────
export const getAllLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [leads, total] = await Promise.all([
      Buy2SellLead.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Buy2SellLead.countDocuments(filter),
    ]);
    res.json({
      leads,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leads" });
  }
};

// ── PATCH /api/buy2sell/leads/:id/status  (admin only) ───────────────────────
export const updateLeadStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const valid = ["new", "contacted", "converted", "closed"];
    if (status && !valid.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const lead = await Buy2SellLead.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(notes !== undefined && { notes }) },
      { new: true },
    );
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json({ message: "Lead updated", lead });
  } catch (err) {
    res.status(500).json({ message: "Failed to update lead" });
  }
};
