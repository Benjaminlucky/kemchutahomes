import Subscription from "../models/Subscription.model.js";

const formatCurrency = (num) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(num);

// ── POST /api/subscriptions ──────────────────────────────────────────────────
export const createSubscription = async (req, res) => {
  try {
    const sub = await Subscription.create(req.body);

    // Send email notification — fire and forget
    sendSubscriptionEmail(sub).catch((err) =>
      console.error("Subscription email failed:", err.message),
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
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
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
    res.json({ message: "Status updated.", subscription: sub });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status." });
  }
};

// ── Email helper ─────────────────────────────────────────────────────────────
async function sendSubscriptionEmail(sub) {
  const rows = [
    ["Estate", sub.estateName],
    ["Subscriber", `${sub.title} ${sub.firstName} ${sub.lastName}`],
    ["Email", sub.email],
    ["Phone", sub.phone],
    ["Gender", sub.gender],
    ["Marital Status", sub.maritalStatus],
    ["Date of Birth", new Date(sub.dateOfBirth).toLocaleDateString("en-NG")],
    ["Nationality", sub.nationality],
    [
      "Address",
      `${sub.residentialAddress}, ${sub.cityTown}, ${sub.lga}, ${sub.state}`,
    ],
    ["Plot Type", sub.plotType],
    ["Plot Size", sub.plotSize],
    ["No. of Plots", String(sub.numberOfPlots)],
    ["Payment Plan", sub.paymentPlan],
    ["Survey Type", sub.surveyType],
    ["Total Amount", formatCurrency(sub.totalAmount)],
    ["Next of Kin", `${sub.kinFirstName} ${sub.kinLastName} — ${sub.kinPhone}`],
  ];

  const html = `
    <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; background: #f9f9fb; border-radius: 12px;">
      <div style="background: linear-gradient(135deg,#3F0C91,#700CEB); padding: 28px 32px; border-radius: 10px; margin-bottom: 28px;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">New Estate Subscription</h1>
        <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">${sub.estateName}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #eee;font-size:12px;color:#6b7280;font-weight:700;width:38%;text-transform:uppercase;letter-spacing:0.05em;">${label}</td>
            <td style="padding:11px 0;border-bottom:1px solid #eee;font-size:14px;color:#0f0a1e;font-weight:700;">${value}</td>
          </tr>
        `,
          )
          .join("")}
      </table>
      <div style="margin-top:28px;padding:16px;background:rgba(112,12,235,0.06);border-radius:8px;border-left:3px solid #700CEB;">
        <p style="margin:0;font-size:13px;color:#700CEB;font-weight:600;">
          Please review and contact the subscriber within 24 hours to proceed.
        </p>
      </div>
      <p style="margin-top:24px;font-size:12px;color:#9ca3af;text-align:center;">Kemchuta Homes Ltd · Automated Notification</p>
    </div>
  `;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Kemchuta Homes <onboarding@khlrealtorsportal.com>",
    to: [process.env.ADMIN_EMAIL || process.env.EMAIL_USER],
    subject: `New Subscription: ${sub.estateName} — ${sub.title} ${sub.firstName} ${sub.lastName}`,
    html,
  });
}
