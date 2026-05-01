import Subscription from "../models/Subscription.model.js";
import {
  generateAcknowledgement,
  generateContractOfSale,
  generatePaymentInvoice,
  generateInstallmentSchedule,
  generateReceipt,
  generateAllocationLetter,
} from "../utils/pdfGenerator.js";

import {
  notifySubscriptionSubmitted,
  notifySubscriptionStatusChanged,
  sendEmail,
} from "../utils/notifications.js";
import {
  calculateCommissions,
  clawbackCommissions,
} from "../utils/commissionCalculator.js";

const fmtNGN = (n = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);

// ── Generate unique reference number ─────────────────────────────────────────
async function generateRefNumber() {
  const year = new Date().getFullYear();
  const count = await Subscription.countDocuments();
  return `KHL-${year}-${String(count + 1).padStart(5, "0")}`;
}

// ── Build installment schedule ────────────────────────────────────────────────
function buildInstallmentSchedule(totalAmount, approvalDate) {
  const deposit = Math.round(totalAmount * 0.3);
  const balance = totalAmount - deposit;
  const monthly = Math.round(balance / 5);
  const start = new Date(approvalDate || new Date());

  const schedule = [
    { dueDate: new Date(start), amount: deposit, isPaid: false },
    ...Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setMonth(d.getMonth() + i + 1);
      return { dueDate: d, amount: monthly, isPaid: false };
    }),
  ];
  return schedule;
}

// ── Helper: convert PDF Buffer to base64 data URI for email attachment ────────
function pdfToBase64(buffer) {
  return buffer.toString("base64");
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/subscriptions
// ─────────────────────────────────────────────────────────────────────────────
export const createSubscription = async (req, res) => {
  try {
    const referenceNumber = await generateRefNumber();
    const sub = await Subscription.create({ ...req.body, referenceNumber });

    // Generate acknowledgement PDF — fire-and-forget with email
    generateAcknowledgement(sub)
      .then(async (pdfBuffer) => {
        // Email to client with PDF attached
        await sendEmail({
          to: sub.email,
          subject: `Subscription Received — ${sub.estateName} [${referenceNumber}]`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
              <div style="background:linear-gradient(135deg,#3F0C91,#700CEB);padding:28px 32px;border-radius:10px;margin-bottom:24px;">
                <h1 style="color:#fff;margin:0;font-size:20px;font-weight:900;">Subscription Received!</h1>
                <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">Reference: ${referenceNumber}</p>
              </div>
              <p style="color:#374151;font-size:15px;line-height:1.75;">
                Dear ${sub.title} ${sub.firstName} ${sub.lastName},<br><br>
                Thank you for subscribing to <strong>${sub.estateName}</strong>. Your application has been received
                and is under review. Our team will contact you within <strong>24–48 hours</strong>.<br><br>
                Your reference number is <strong>${referenceNumber}</strong> — please quote this in all correspondence.
              </p>
              <p style="color:#374151;font-size:14px;margin-top:16px;">
                Please find your <strong>Subscription Acknowledgement</strong> attached to this email.
              </p>
            </div>`,
          attachments: [
            {
              filename: `Acknowledgement-${referenceNumber}.pdf`,
              content: pdfToBase64(pdfBuffer),
              encoding: "base64",
              contentType: "application/pdf",
            },
          ],
        });

        // Save document record to subscription
        await Subscription.findByIdAndUpdate(sub._id, {
          $push: {
            documents: {
              type: "acknowledgement",
              label: "Subscription Acknowledgement",
              url: "", // store in Cloudinary in production
              generatedAt: new Date(),
            },
          },
        });
      })
      .catch((err) =>
        console.error("Acknowledgement PDF failed:", err.message),
      );

    // Notify admin
    notifySubscriptionSubmitted(sub).catch(() => null);

    res.status(201).json({
      message:
        "Subscription submitted successfully! Check your email for confirmation.",
      subscription: {
        _id: sub._id,
        referenceNumber,
        estateName: sub.estateName,
        status: sub.status,
      },
    });
  } catch (err) {
    console.error("createSubscription:", err);
    res
      .status(500)
      .json({ message: err.message || "Failed to submit subscription." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/subscriptions — Admin
// ─────────────────────────────────────────────────────────────────────────────
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
        { referenceNumber: { $regex: search, $options: "i" } },
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/subscriptions/my — Client portal (by email from token)
// ─────────────────────────────────────────────────────────────────────────────
export const getMySubscriptions = async (req, res) => {
  try {
    // req.user is set by protectClient middleware
    const subs = await Subscription.find({ email: req.user.email })
      .sort({ createdAt: -1 })
      .lean();
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subscriptions." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/subscriptions/:id/status — Admin
// Approval triggers: Contract of Sale + Payment Invoice (attached to email)
// and saves them to sub.documents[] so client portal can download
// ─────────────────────────────────────────────────────────────────────────────
export const updateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = [
      "pending",
      "reviewed",
      "approved",
      "rejected",
      "payment_confirmed",
      "allocated",
    ];
    if (!valid.includes(status))
      return res.status(400).json({ message: "Invalid status." });

    // FIX: fetch fresh first so referenceNumber is always populated
    const existing = await Subscription.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ message: "Subscription not found." });

    const sub = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    // ── On approval — generate Contract + Invoice + Installment Schedule ──
    if (status === "approved") {
      // Build installment schedule if needed
      if (
        sub.paymentPlan === "6 Months Installment" &&
        !sub.installmentSchedule?.length
      ) {
        const schedule = buildInstallmentSchedule(sub.totalAmount, new Date());
        await Subscription.findByIdAndUpdate(sub._id, {
          installmentSchedule: schedule,
        });
        sub.installmentSchedule = schedule;
      }

      // ── Calculate commissions up the 4-level hierarchy ────────────────
      // subscriptionRealtorId must be stored on the sub — if your SubscribeModal
      // captures it, pass it as req.body.realtorId; otherwise pass null to skip
      const realtorId = sub.realtorId || req.body.realtorId || null;
      calculateCommissions(sub._id, realtorId).catch((e) =>
        console.error("Commission calculation error:", e.message),
      );

      // Generate all approval documents in parallel — fire-and-forget
      Promise.all([
        generateContractOfSale(sub),
        generatePaymentInvoice(sub),
        sub.paymentPlan === "6 Months Installment"
          ? generateInstallmentSchedule(sub)
          : Promise.resolve(null),
      ])
        .then(async ([contractBuf, invoiceBuf, scheduleBuf]) => {
          const ref =
            sub.referenceNumber || sub._id.toString().slice(-8).toUpperCase();

          const attachments = [
            {
              filename: `Contract-of-Sale-${ref}.pdf`,
              content: pdfToBase64(contractBuf),
              contentType: "application/pdf",
            },
            {
              filename: `Payment-Invoice-${ref}.pdf`,
              content: pdfToBase64(invoiceBuf),
              contentType: "application/pdf",
            },
          ];
          if (scheduleBuf) {
            attachments.push({
              filename: `Instalment-Schedule-${ref}.pdf`,
              content: pdfToBase64(scheduleBuf),
              contentType: "application/pdf",
            });
          }

          // Send email WITH attachments
          await sendEmail({
            to: sub.email,
            subject: `🎉 Subscription Approved — ${sub.estateName} [${ref}]`,
            attachments,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:0;border-radius:12px;overflow:hidden;">
                <div style="background:linear-gradient(135deg,#3F0C91,#700CEB);padding:32px;">
                  <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">Subscription Approved! 🎉</h1>
                  <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:13px;">Reference: ${ref}</p>
                </div>
                <div style="padding:32px;background:#fff;">
                  <p style="color:#374151;font-size:15px;line-height:1.75;margin-top:0;">
                    Dear <strong>${sub.title} ${sub.firstName} ${sub.lastName}</strong>,<br><br>
                    Congratulations! Your subscription for <strong>${sub.estateName}</strong> has been <strong>approved</strong>.
                    Please find the following documents attached to this email:
                  </p>
                  <div style="background:#f9f6ff;border-radius:10px;padding:16px 20px;margin:20px 0;border-left:4px solid #700CEB;">
                    <p style="margin:4px 0;font-size:14px;color:#374151;">✅ <strong>Contract of Sale</strong> — review, sign and return</p>
                    <p style="margin:4px 0;font-size:14px;color:#374151;">✅ <strong>Payment Invoice</strong> — make initial deposit</p>
                    ${scheduleBuf ? '<p style="margin:4px 0;font-size:14px;color:#374151;">✅ <strong>Instalment Schedule</strong> — payment timeline</p>' : ""}
                  </div>
                  <p style="color:#374151;font-size:15px;line-height:1.75;">
                    Next steps:<br>
                    1. Review and sign the Contract of Sale<br>
                    2. Make your initial deposit using the Payment Invoice<br>
                    3. Quote reference <strong style="color:#700CEB;">${ref}</strong> on your bank transfer<br>
                    4. Send proof of payment to <strong>info@kemchutahomesltd.com</strong>
                  </p>
                  <p style="color:#374151;font-size:14px;">
                    You can also download all your documents from your
                    <a href="${process.env.FRONTEND_URL}/client/portal/documents" style="color:#700CEB;font-weight:700;">Client Portal</a>.
                  </p>
                </div>
                <div style="background:#0f0a1e;padding:16px 32px;text-align:center;">
                  <p style="color:#a3a3a3;font-size:12px;margin:0;">© ${new Date().getFullYear()} Kemchuta Homes Limited · info@kemchutahomesltd.com</p>
                </div>
              </div>`,
          });

          // Save document records so client portal can list them
          const docs = [
            {
              type: "contract",
              label: "Contract of Sale",
              generatedAt: new Date(),
            },
            {
              type: "invoice",
              label: "Payment Invoice",
              generatedAt: new Date(),
            },
          ];
          if (scheduleBuf)
            docs.push({
              type: "schedule",
              label: "Instalment Schedule",
              generatedAt: new Date(),
            });
          await Subscription.findByIdAndUpdate(sub._id, {
            $push: { documents: { $each: docs } },
          });

          console.log(
            `✅ Approval docs sent to ${sub.email} — ${docs.length} documents`,
          );
        })
        .catch((err) =>
          console.error("❌ Approval PDF generation failed:", err.message),
        );
    }

    // ── On rejection — clawback any pending commissions ──────────────────
    if (status === "rejected") {
      clawbackCommissions(sub._id, "Subscription rejected by admin").catch(
        (e) => console.error("Clawback error:", e.message),
      );
    }

    // Notify client of status change via notification system
    notifySubscriptionStatusChanged(sub).catch(() => null);

    res.json({ message: "Status updated.", subscription: sub });
  } catch (err) {
    console.error("updateSubscriptionStatus:", err);
    res.status(500).json({ message: "Failed to update status." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/subscriptions/:id/payments — Step 1: Admin logs a payment (pending)
// The payment is recorded but NOT yet confirmed — no receipt issued yet.
// Admin must then call PATCH /:id/payments/:paymentId/confirm to issue receipt.
// This two-step process prevents receipt fraud.
// ─────────────────────────────────────────────────────────────────────────────
export const recordPayment = async (req, res) => {
  try {
    const { amount, method, reference, note, paidAt } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Valid amount required" });

    const paymentRecord = {
      amount: Number(amount),
      paidAt: paidAt ? new Date(paidAt) : new Date(),
      method: method || "Bank Transfer",
      reference: reference || "",
      note: note || "",
      recordedBy: req.user?.email || "admin",
      confirmed: false, // ← awaiting admin confirmation before receipt
    };

    const sub = await Subscription.findByIdAndUpdate(
      req.params.id,
      { $push: { payments: paymentRecord } },
      { new: true },
    );
    if (!sub)
      return res.status(404).json({ message: "Subscription not found." });

    res.json({
      message:
        "Payment logged. Click Confirm Payment to verify and issue the official receipt.",
      subscription: sub,
      pendingPaymentId: sub.payments[sub.payments.length - 1]._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to record payment." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/subscriptions/:id/payments/:paymentId/confirm — Step 2: Admin confirms
// Marks the payment as verified, updates amountPaid, issues Official Receipt PDF.
// ─────────────────────────────────────────────────────────────────────────────
export const confirmPayment = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub)
      return res.status(404).json({ message: "Subscription not found." });

    const payment = sub.payments.id(req.params.paymentId);
    if (!payment)
      return res.status(404).json({ message: "Payment not found." });
    if (payment.confirmed)
      return res.status(400).json({ message: "Payment already confirmed." });

    // Mark confirmed and update totals
    payment.confirmed = true;
    payment.confirmedBy = req.user?.email || "admin";
    payment.confirmedAt = new Date();
    sub.amountPaid = (sub.amountPaid || 0) + payment.amount;

    // Mark matching installment as paid
    if (
      sub.paymentPlan === "6 Months Installment" &&
      sub.installmentSchedule?.length
    ) {
      const unpaidIdx = sub.installmentSchedule.findIndex((s) => !s.isPaid);
      if (unpaidIdx !== -1) {
        sub.installmentSchedule[unpaidIdx].isPaid = true;
        sub.installmentSchedule[unpaidIdx].paidAt = payment.paidAt;
        sub.installmentSchedule[unpaidIdx].paymentId = payment._id;
      }
    }

    // Auto-advance status if fully paid
    if (sub.amountPaid >= sub.totalAmount && sub.status === "approved") {
      sub.status = "payment_confirmed";
    }

    await sub.save();

    // Generate and email Official Receipt PDF
    const receiptNum = sub.payments.filter((p) => p.confirmed).length;
    const ref =
      sub.referenceNumber || sub._id.toString().slice(-8).toUpperCase();

    generateReceipt(sub, payment)
      .then(async (pdfBuffer) => {
        const receiptLabel = `Payment Receipt #${receiptNum}`;

        await sendEmail({
          to: sub.email,
          subject: `Payment Receipt — ${sub.estateName} [${ref}]`,
          attachments: [
            {
              filename: `Receipt-${ref}-${String(receiptNum).padStart(2, "0")}.pdf`,
              content: pdfToBase64(pdfBuffer),
              contentType: "application/pdf",
            },
          ],
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:0;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#3F0C91,#700CEB);padding:32px;">
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">Payment Confirmed ✅</h1>
              </div>
              <div style="padding:32px;background:#fff;">
                <p style="color:#374151;font-size:15px;line-height:1.75;margin-top:0;">
                  Dear <strong>${sub.title} ${sub.firstName} ${sub.lastName}</strong>,<br><br>
                  We have confirmed your payment of <strong style="color:#700CEB;">${fmtNGN(payment.amount)}</strong>
                  for <strong>${sub.estateName}</strong>. Your official receipt is attached.
                </p>
                <div style="background:#f9f6ff;border-radius:10px;padding:16px 20px;margin:16px 0;">
                  <p style="margin:4px 0;font-size:13px;color:#374151;"><strong>Amount:</strong> ${fmtNGN(payment.amount)}</p>
                  <p style="margin:4px 0;font-size:13px;color:#374151;"><strong>Total Paid:</strong> ${fmtNGN(sub.amountPaid)} of ${fmtNGN(sub.totalAmount)}</p>
                  <p style="margin:4px 0;font-size:13px;color:#374151;"><strong>Balance:</strong> ${fmtNGN(Math.max(0, sub.totalAmount - sub.amountPaid))}</p>
                </div>
                ${
                  sub.amountPaid >= sub.totalAmount
                    ? `<p style="color:#059669;font-weight:700;font-size:15px;">🎉 Full payment received! Plot allocation is being processed.</p>`
                    : `<p style="color:#374151;font-size:14px;">Your next instalment is due as per your payment schedule.</p>`
                }
                <p style="color:#374151;font-size:14px;">
                  Download all your documents from your
                  <a href="${process.env.FRONTEND_URL}/client/portal/documents" style="color:#700CEB;font-weight:700;">Client Portal</a>.
                </p>
              </div>
              <div style="background:#0f0a1e;padding:16px 32px;text-align:center;">
                <p style="color:#a3a3a3;font-size:12px;margin:0;">© ${new Date().getFullYear()} Kemchuta Homes Limited</p>
              </div>
            </div>`,
        });

        // Save receipt doc record
        await Subscription.findByIdAndUpdate(sub._id, {
          $push: {
            documents: {
              type: "receipt",
              label: receiptLabel,
              generatedAt: new Date(),
            },
          },
        });

        console.log(`✅ Receipt issued — ${ref} #${receiptNum} → ${sub.email}`);
      })
      .catch((err) => console.error("❌ Receipt PDF failed:", err.message));

    res.json({
      message: "Payment confirmed. Receipt is being generated and emailed.",
      subscription: sub,
    });
  } catch (err) {
    console.error("confirmPayment:", err);
    res.status(500).json({ message: "Failed to confirm payment." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/subscriptions/:id/allocate — Admin assigns plot + triggers Allocation Letter
// ─────────────────────────────────────────────────────────────────────────────
export const allocatePlot = async (req, res) => {
  try {
    const { plotNumber } = req.body;
    if (!plotNumber?.trim())
      return res.status(400).json({ message: "Plot number is required" });

    const sub = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        plotNumber,
        allocationDate: new Date(),
        status: "allocated",
      },
      { new: true },
    );
    if (!sub)
      return res.status(404).json({ message: "Subscription not found." });

    // Generate allocation letter
    const ref =
      sub.referenceNumber || sub._id.toString().slice(-8).toUpperCase();
    generateAllocationLetter(sub)
      .then(async (pdfBuffer) => {
        await sendEmail({
          to: sub.email,
          subject: `🏡 Plot Allocated — ${sub.estateName} [${ref}]`,
          attachments: [
            {
              filename: `Allocation-Letter-${ref}.pdf`,
              content: pdfToBase64(pdfBuffer),
              contentType: "application/pdf",
            },
          ],
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:0;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#3F0C91,#700CEB);padding:32px;">
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">Plot Allocated! 🏡</h1>
                <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:13px;">Reference: ${ref}</p>
              </div>
              <div style="padding:32px;background:#fff;">
                <p style="color:#374151;font-size:15px;line-height:1.75;margin-top:0;">
                  Dear <strong>${sub.title} ${sub.firstName} ${sub.lastName}</strong>,<br><br>
                  Congratulations! Your plot at <strong>${sub.estateName}</strong> has been officially allocated.
                  Your plot number is <strong style="color:#700CEB;">${plotNumber}</strong>.
                </p>
                <div style="background:#f9f6ff;border-radius:10px;padding:16px 20px;margin:16px 0;border-left:4px solid #700CEB;">
                  <p style="margin:4px 0;font-size:14px;color:#374151;">📄 <strong>Letter of Allocation</strong> — attached to this email</p>
                  <p style="margin:4px 0;font-size:13px;color:#6b7280;">Keep this document safe as proof of ownership pending title document processing.</p>
                </div>
                <p style="color:#374151;font-size:14px;">
                  Download all your documents from your
                  <a href="${process.env.FRONTEND_URL}/client/portal/documents" style="color:#700CEB;font-weight:700;">Client Portal</a>.
                </p>
              </div>
              <div style="background:#0f0a1e;padding:16px 32px;text-align:center;">
                <p style="color:#a3a3a3;font-size:12px;margin:0;">© ${new Date().getFullYear()} Kemchuta Homes Limited</p>
              </div>
            </div>`,
        });
        await Subscription.findByIdAndUpdate(sub._id, {
          $push: {
            documents: {
              type: "allocation",
              label: "Letter of Allocation",
              generatedAt: new Date(),
            },
          },
        });
        console.log(`✅ Allocation letter sent to ${sub.email}`);
      })
      .catch((err) =>
        console.error("❌ Allocation letter PDF failed:", err.message),
      );

    res.json({ message: "Plot allocated.", subscription: sub });
  } catch (err) {
    res.status(500).json({ message: "Failed to allocate plot." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/subscriptions/:id/documents/:docType — Stream PDF to client
// ─────────────────────────────────────────────────────────────────────────────
export const downloadDocument = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub)
      return res.status(404).json({ message: "Subscription not found." });

    const { docType } = req.params;
    let pdfBuffer;

    switch (docType) {
      case "acknowledgement":
        pdfBuffer = await generateAcknowledgement(sub);
        break;
      case "contract":
        pdfBuffer = await generateContractOfSale(sub);
        break;
      case "invoice":
        pdfBuffer = await generatePaymentInvoice(sub);
        break;
      case "schedule":
        pdfBuffer = await generateInstallmentSchedule(sub);
        break;
      case "allocation":
        pdfBuffer = await generateAllocationLetter(sub);
        break;
      default:
        return res.status(400).json({ message: "Invalid document type." });
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${docType}-${sub.referenceNumber}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });
    res.end(pdfBuffer);
  } catch (err) {
    console.error("downloadDocument:", err);
    res.status(500).json({ message: "Failed to generate document." });
  }
};
