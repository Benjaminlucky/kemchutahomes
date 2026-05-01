import { ROISettings, Buy2SellLead } from "../models/Buy2sell.model.js";
import {
  generateInvestmentCertificate,
  generateInvestmentAgreement,
  generatePayoutConfirmation,
} from "../utils/pdfGenerator.js";
import { sendEmail } from "../utils/notifications.js";

const ADMIN_EMAIL = () =>
  process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "";

const fmtNGN = (n = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);

function pdfToBase64(buffer) {
  return buffer.toString("base64");
}

// ── Maturity date calculator ───────────────────────────────────────────────────
function calcMaturityDate(startDate, duration) {
  const d = new Date(startDate);
  switch (duration) {
    case "6 Months":
      d.setMonth(d.getMonth() + 6);
      break;
    case "1 Year":
      d.setFullYear(d.getFullYear() + 1);
      break;
    case "18 Months":
      d.setMonth(d.getMonth() + 18);
      break;
    default:
      d.setFullYear(d.getFullYear() + 1);
  }
  return d;
}

// ── Ref number ────────────────────────────────────────────────────────────────
async function generateRefNumber() {
  const year = new Date().getFullYear();
  const count = await Buy2SellLead.countDocuments();
  return `KHL-B2S-${year}-${String(count + 1).padStart(5, "0")}`;
}

// ── GET /api/buy2sell/roi  (public) ──────────────────────────────────────────
export const getROISettings = async (req, res) => {
  try {
    let settings = await ROISettings.findOne({ singleton: "global" }).lean();
    if (!settings) settings = await ROISettings.create({ singleton: "global" });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ROI settings" });
  }
};

// ── PUT /api/buy2sell/roi  (admin) ────────────────────────────────────────────
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
    res.status(500).json({ message: "Failed to update ROI settings" });
  }
};

// ── POST /api/buy2sell/leads  (public — form submission) ─────────────────────
export const submitBuy2SellLead = async (req, res) => {
  try {
    const { fullName, email, phone, duration } = req.body;
    if (!fullName?.trim() || !email?.trim() || !phone?.trim())
      return res
        .status(400)
        .json({ message: "Full name, email and phone are required" });

    const roi = await ROISettings.findOne({ singleton: "global" }).lean();
    const roiMap = {
      "6 Months": roi?.roiPercent6Months ?? 22,
      "1 Year": roi?.roiPercent1Year ?? 48,
      "18 Months": roi?.roiPercent18Months ?? 75,
    };
    const roiPercent = roiMap[duration] ?? roiMap["1 Year"];
    const referenceNumber = await generateRefNumber();

    const lead = await Buy2SellLead.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      duration: duration || "1 Year",
      roiPercent,
      referenceNumber,
    });

    // Admin notification
    sendEmail({
      to: ADMIN_EMAIL(),
      subject: `New Buy2Sell Lead — ${fullName} [${referenceNumber}]`,
      html: `<div style="font-family:sans-serif;padding:24px;">
        <h2>New Buy2Sell Enquiry</h2>
        <p><strong>Ref:</strong> ${referenceNumber}</p>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Duration:</strong> ${duration}</p>
        <p><strong>ROI Rate:</strong> ${roiPercent}%</p>
      </div>`,
    }).catch(() => null);

    // Client acknowledgement
    sendEmail({
      to: email.trim(),
      subject: `Buy2Sell Enquiry Received — Kemchuta Homes [${referenceNumber}]`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <div style="background:linear-gradient(135deg,#3F0C91,#700CEB);padding:28px 32px;border-radius:10px;margin-bottom:24px;">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:900;">Enquiry Received!</h1>
        </div>
        <p style="color:#374151;font-size:15px;line-height:1.75;">
          Dear ${fullName},<br><br>
          Thank you for your interest in our Buy2Sell investment scheme.
          Your reference number is <strong>${referenceNumber}</strong>.<br><br>
          Our investment team will contact you within <strong>24 hours</strong> to discuss the next steps,
          including confirming your investment amount and payment details.
        </p>
      </div>`,
    }).catch(() => null);

    res.status(201).json({
      message:
        "Enquiry submitted successfully! We'll contact you within 24 hours.",
      lead: {
        id: lead._id,
        referenceNumber,
        fullName,
        email,
        phone,
        duration,
        roiPercent,
      },
    });
  } catch (err) {
    console.error("submitBuy2SellLead:", err);
    res
      .status(500)
      .json({ message: "Failed to submit enquiry. Please try again." });
  }
};

// ── GET /api/buy2sell/leads  (admin) ─────────────────────────────────────────
export const getAllLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { referenceNumber: { $regex: search, $options: "i" } },
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

// ── PATCH /api/buy2sell/leads/:id/status  (admin) ────────────────────────────
export const updateLeadStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const valid = [
      "new",
      "contacted",
      "approved",
      "active",
      "matured",
      "paid_out",
      "closed",
    ];
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

// ── POST /api/buy2sell/leads/:id/confirm-principal  (admin)
// Admin confirms principal received, triggers Certificate + Agreement PDFs
// ─────────────────────────────────────────────────────────────────────────────
export const confirmPrincipal = async (req, res) => {
  try {
    const { principalAmount, investmentDate } = req.body;
    if (!principalAmount || principalAmount <= 0)
      return res
        .status(400)
        .json({ message: "Valid principal amount required" });

    const lead = await Buy2SellLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const start = investmentDate ? new Date(investmentDate) : new Date();
    const maturityDate = calcMaturityDate(start, lead.duration);
    const expectedROI = Math.round(principalAmount * (lead.roiPercent / 100));
    const expectedPayout = principalAmount + expectedROI;

    const updated = await Buy2SellLead.findByIdAndUpdate(
      lead._id,
      {
        principalAmount,
        investmentDate: start,
        maturityDate,
        expectedROI,
        expectedPayout,
        status: "active",
        $push: {
          payments: {
            amount: principalAmount,
            paidAt: start,
            method: req.body.method || "Bank Transfer",
            reference: req.body.reference || "",
            type: "principal",
          },
        },
      },
      { new: true },
    );

    // Generate Certificate + Agreement in parallel
    Promise.all([
      generateInvestmentCertificate(updated),
      generateInvestmentAgreement(updated),
    ])
      .then(async ([certBuf, agrmtBuf]) => {
        await sendEmail({
          to: updated.email,
          subject: `Investment Active — ${updated.duration} Plan [${updated.referenceNumber}]`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
            <div style="background:linear-gradient(135deg,#3F0C91,#700CEB);padding:28px 32px;border-radius:10px;margin-bottom:24px;">
              <h1 style="color:#fff;margin:0;font-size:20px;font-weight:900;">Investment Confirmed! 🎉</h1>
            </div>
            <p style="color:#374151;font-size:15px;line-height:1.75;">
              Dear ${updated.fullName},<br><br>
              Your Buy2Sell investment is now <strong>active</strong>. Here are your investment details:<br><br>
              💰 <strong>Principal:</strong> ${fmtNGN(principalAmount)}<br>
              📈 <strong>ROI Rate:</strong> ${updated.roiPercent}%<br>
              💵 <strong>Expected ROI:</strong> ${fmtNGN(expectedROI)}<br>
              🏆 <strong>Expected Payout:</strong> ${fmtNGN(expectedPayout)}<br>
              📅 <strong>Maturity Date:</strong> ${maturityDate.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}<br><br>
              Your Investment Certificate and Agreement are attached. Please sign and return the Agreement.
            </p>
          </div>`,
          attachments: [
            {
              filename: `Investment-Certificate-${updated.referenceNumber}.pdf`,
              content: pdfToBase64(certBuf),
              encoding: "base64",
              contentType: "application/pdf",
            },
            {
              filename: `Investment-Agreement-${updated.referenceNumber}.pdf`,
              content: pdfToBase64(agrmtBuf),
              encoding: "base64",
              contentType: "application/pdf",
            },
          ],
        });
        await Buy2SellLead.findByIdAndUpdate(lead._id, {
          $push: {
            documents: {
              $each: [
                {
                  type: "certificate",
                  label: "Investment Certificate",
                  generatedAt: new Date(),
                },
                {
                  type: "agreement",
                  label: "Investment Agreement",
                  generatedAt: new Date(),
                },
              ],
            },
          },
        });
      })
      .catch((err) =>
        console.error("Investment PDF generation failed:", err.message),
      );

    res.json({
      message: "Principal confirmed. Investment is now active.",
      lead: updated,
    });
  } catch (err) {
    console.error("confirmPrincipal:", err);
    res.status(500).json({ message: "Failed to confirm principal." });
  }
};

// ── POST /api/buy2sell/leads/:id/process-payout  (admin)
// Admin triggers payout at maturity — generates Payout Confirmation
// ─────────────────────────────────────────────────────────────────────────────
export const processPayout = async (req, res) => {
  try {
    const { actualPayout, payoutReference } = req.body;

    const lead = await Buy2SellLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const payout = actualPayout || lead.expectedPayout;
    const updated = await Buy2SellLead.findByIdAndUpdate(
      lead._id,
      {
        actualPayout: payout,
        payoutDate: new Date(),
        status: "paid_out",
        $push: {
          payments: {
            amount: payout,
            paidAt: new Date(),
            method: req.body.method || "Bank Transfer",
            reference: payoutReference || "",
            type: "payout",
          },
        },
      },
      { new: true },
    );

    // Generate Payout Confirmation
    generatePayoutConfirmation(updated)
      .then(async (pdfBuffer) => {
        await sendEmail({
          to: updated.email,
          subject: `Investment Matured — Payout Confirmed [${updated.referenceNumber}]`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
            <div style="background:linear-gradient(135deg,#3F0C91,#700CEB);padding:28px 32px;border-radius:10px;margin-bottom:24px;">
              <h1 style="color:#fff;margin:0;font-size:20px;font-weight:900;">Payout Sent! 🎊</h1>
            </div>
            <p style="color:#374151;font-size:15px;line-height:1.75;">
              Dear ${updated.fullName},<br><br>
              Congratulations! Your Buy2Sell investment has matured and your payout of
              <strong>${fmtNGN(payout)}</strong> has been processed.<br><br>
              Please find your Payout Confirmation Letter attached.
              Thank you for investing with Kemchuta Homes!
            </p>
          </div>`,
          attachments: [
            {
              filename: `Payout-Confirmation-${updated.referenceNumber}.pdf`,
              content: pdfToBase64(pdfBuffer),
              encoding: "base64",
              contentType: "application/pdf",
            },
          ],
        });
        await Buy2SellLead.findByIdAndUpdate(lead._id, {
          $push: {
            documents: {
              type: "payout_confirmation",
              label: "Payout Confirmation",
              generatedAt: new Date(),
            },
          },
        });
      })
      .catch((err) =>
        console.error("Payout confirmation PDF failed:", err.message),
      );

    res.json({ message: "Payout processed successfully.", lead: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to process payout." });
  }
};

// ── GET /api/buy2sell/leads/:id/documents/:docType — Download PDF ─────────────
export const downloadDocument = async (req, res) => {
  try {
    const lead = await Buy2SellLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const { docType } = req.params;
    let pdfBuffer;
    switch (docType) {
      case "certificate":
        pdfBuffer = await generateInvestmentCertificate(lead);
        break;
      case "agreement":
        pdfBuffer = await generateInvestmentAgreement(lead);
        break;
      case "payout_confirmation":
        pdfBuffer = await generatePayoutConfirmation(lead);
        break;
      default:
        return res.status(400).json({ message: "Invalid document type." });
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${docType}-${lead.referenceNumber}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });
    res.end(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate document." });
  }
};

// ── GET /api/buy2sell/my — Client portal ─────────────────────────────────────
export const getMyInvestments = async (req, res) => {
  try {
    const leads = await Buy2SellLead.find({ email: req.user.email })
      .sort({ createdAt: -1 })
      .lean();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch investments." });
  }
};
