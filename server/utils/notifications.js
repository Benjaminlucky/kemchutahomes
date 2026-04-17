/**
 * utils/notifications.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Email notification system for Kemchuta Homes.
 * Channel: Email via Resend (existing integration, unchanged).
 *
 * SMS and WhatsApp channels are stubbed for future integration —
 * add TERMII_API_KEY / WA_PHONE_NUMBER_ID env vars and uncomment
 * sendSMS / sendWhatsApp when ready. No code restructuring needed.
 *
 * Required .env variables:
 *   RESEND_API_KEY   — already present
 *   ADMIN_EMAIL      — already present
 *   FRONTEND_URL     — e.g. https://kemchutahomesltd.com
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Resend } from "resend";

// ── Lazy-init Resend client ──────────────────────────────────────────────────
let _resend = null;

function getResend() {
  if (_resend) return _resend;
  if (!process.env.RESEND_API_KEY) return null;
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
export const fmtNGN = (n = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL — Resend
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmail({ to, subject, html }) {
  const resend = getResend();
  if (!resend) {
    console.warn("⚠️  RESEND_API_KEY missing — email skipped");
    return { success: false, error: "RESEND_API_KEY missing" };
  }
  try {
    const toArray = Array.isArray(to) ? to : [to];
    const { data, error } = await resend.emails.send({
      from: "Kemchuta Homes <onboarding@khlrealtorsportal.com>",
      to: toArray,
      subject,
      html,
    });
    if (error) throw new Error(error.message);
    console.log(`✅ EMAIL sent → ${toArray.join(", ")} [${data.id}]`);
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error(`❌ EMAIL failed → ${to} | ${err.message}`);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL HTML TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

const baseHtml = (badge, headlineHtml, bodyHtml) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  body{font-family:'Inter',Arial,sans-serif;background:#f5f5f5;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
  .wrapper{width:100%;background:#f5f5f5;padding-bottom:40px;}
  .main{background:#fff;width:100%;max-width:600px;margin:20px auto 0;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);}
  .header{background:linear-gradient(135deg,#3F0C91,#700CEB);padding:44px 20px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;text-transform:uppercase;}
  .badge{display:inline-block;background:rgba(255,255,255,0.2);color:#fff;font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;margin-top:10px;letter-spacing:1px;}
  .content{padding:36px 32px;color:#262626;line-height:1.7;}
  .content h2{color:#000;font-size:20px;margin-top:0;font-weight:700;}
  .content p{font-size:15px;color:#525252;}
  table.data{width:100%;border-collapse:collapse;margin:20px 0;}
  table.data td{padding:10px 0;border-bottom:1px solid #eee;font-size:13px;}
  table.data td:first-child{color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.05em;width:38%;}
  table.data td:last-child{color:#0f0a1e;font-weight:700;}
  .btn-wrapper{text-align:center;margin:32px 0;}
  .btn{background:#700CEB;color:#fff!important;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 12px rgba(112,12,235,0.25);}
  .notice{background:rgba(112,12,235,0.06);border-left:3px solid #700CEB;border-radius:6px;padding:14px 18px;margin:24px 0;}
  .notice p{margin:0;font-size:13px;color:#700CEB;font-weight:600;}
  .footer{background:#171717;padding:28px;text-align:center;color:#a3a3a3;font-size:13px;}
  .footer a{color:#bd80f8;text-decoration:none;font-weight:600;}
  .footer p{margin:7px 0;}
  .divider{height:1px;background:#404040;margin:18px auto;width:80%;}
</style></head><body>
<div class="wrapper"><div class="main">
<div class="header">
  <h1>Kemchuta Homes</h1>
  ${badge ? `<span class="badge">${badge}</span>` : ""}
</div>
<div class="content">
  ${headlineHtml}
  ${bodyHtml}
</div>
<div class="footer">
  <p><a href="https://kemchutahomesltd.com/">Website</a> &nbsp;|&nbsp; <a href="#">Instagram</a> &nbsp;|&nbsp; <a href="#">Support</a></p>
  <div class="divider"></div>
  <p>&copy; ${new Date().getFullYear()} Kemchuta Homes Ltd. All rights reserved.</p>
  <p>Lekki, Lagos, Nigeria</p>
</div>
</div></div></body></html>`;

const dataRows = (rows) =>
  `<table class="data">${rows.map(([l, v]) => `<tr><td>${l}</td><td>${v || "—"}</td></tr>`).join("")}</table>`;

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN + CLIENT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = () =>
  process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "";

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/* ── 1. NEW INSPECTION BOOKED ────────────────────────────────────────────── */
export async function notifyInspectionBooked(inspection) {
  const {
    estateName,
    firstName,
    lastName,
    email,
    phone,
    inspectionDate,
    persons,
  } = inspection;
  const fullName = `${firstName} ${lastName}`;
  const dateStr = fmtDate(inspectionDate);
  const persons_ = `${persons} person${persons > 1 ? "s" : ""}`;

  // Admin email
  const adminHtml = baseHtml(
    "NEW INSPECTION",
    `<h2>New Inspection Booking 📅</h2>
     <p>A new site visit has been booked. Please confirm with the client at your earliest convenience.</p>`,
    `${dataRows([
      ["Estate", estateName],
      ["Client", fullName],
      ["Email", email],
      ["Phone", phone],
      ["Date", dateStr],
      ["Persons", persons_],
    ])}
    <div class="notice"><p>Please confirm or reschedule this inspection within 24 hours.</p></div>`,
  );

  // Client confirmation email
  const clientHtml = baseHtml(
    "INSPECTION RECEIVED",
    `<h2>Inspection Booking Received 🏡</h2>
     <p>Hi ${firstName}, your inspection request has been received. Our team will contact you shortly to confirm the details.</p>`,
    `${dataRows([
      ["Estate", estateName],
      ["Date", dateStr],
      ["Persons", persons_],
    ])}
    <div class="notice"><p>Our team will call you within 24 hours to confirm your visit. Please keep your phone reachable.</p></div>
    <div class="btn-wrapper"><a href="https://kemchutahomesltd.com/developments" class="btn">Explore More Estates</a></div>`,
  );

  await Promise.allSettled([
    sendEmail({
      to: ADMIN_EMAIL(),
      subject: `New Inspection: ${estateName} — ${fullName}`,
      html: adminHtml,
    }),
    sendEmail({
      to: email,
      subject: `Inspection Booking Received — ${estateName}`,
      html: clientHtml,
    }),
  ]);
}

/* ── 2. INSPECTION STATUS CHANGED ────────────────────────────────────────── */
export async function notifyInspectionStatusChanged(inspection) {
  const { estateName, firstName, email, inspectionDate, status } = inspection;
  const dateStr = fmtDate(inspectionDate);

  const messages = {
    confirmed: {
      subject: `✅ Inspection Confirmed — ${estateName}`,
      heading: "Your Inspection is Confirmed! ✅",
      body: `Great news, ${firstName}! Your site visit for <strong>${estateName}</strong> on ${dateStr} has been <strong>confirmed</strong> by our team.`,
    },
    cancelled: {
      subject: `Inspection Cancelled — ${estateName}`,
      heading: "Inspection Cancelled",
      body: `Hi ${firstName}, we're sorry but your inspection for <strong>${estateName}</strong> on ${dateStr} has been cancelled. Please contact us to reschedule.`,
    },
    completed: {
      subject: `Inspection Completed — ${estateName}`,
      heading: "Thank You for Visiting! 🙏",
      body: `Hi ${firstName}, thank you for visiting <strong>${estateName}</strong>! We hope you loved what you saw. Ready to subscribe? Our team is here to help.`,
    },
  };

  const msg = messages[status];
  if (!msg) return; // pending — no client notification needed

  const html = baseHtml(
    status.toUpperCase(),
    `<h2>${msg.heading}</h2><p>${msg.body}</p>`,
    `${dataRows([
      ["Estate", estateName],
      ["Date", dateStr],
      ["Status", status.charAt(0).toUpperCase() + status.slice(1)],
    ])}
    <div class="btn-wrapper"><a href="https://kemchutahomesltd.com/contact" class="btn">Contact Us</a></div>`,
  );

  await sendEmail({ to: email, subject: msg.subject, html });
}

/* ── 3. NEW SUBSCRIPTION SUBMITTED ──────────────────────────────────────── */
export async function notifySubscriptionSubmitted(sub) {
  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;
  const amount = fmtNGN(sub.totalAmount);

  // Admin email — full KYC details
  const adminHtml = baseHtml(
    "NEW SUBSCRIPTION",
    `<h2>New Estate Subscription 📋</h2>
     <p>A new subscription form has been submitted. Please review and contact the subscriber within 24 hours.</p>`,
    dataRows([
      ["Estate", sub.estateName],
      ["Subscriber", fullName],
      ["Email", sub.email],
      ["Phone", sub.phone],
      ["Gender", sub.gender],
      ["Marital", sub.maritalStatus],
      ["DOB", new Date(sub.dateOfBirth).toLocaleDateString("en-NG")],
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
      ["Total Amount", amount],
      [
        "Next of Kin",
        `${sub.kinFirstName} ${sub.kinLastName} — ${sub.kinPhone}`,
      ],
    ]),
  );

  // Client acknowledgment email
  const clientHtml = baseHtml(
    "SUBSCRIPTION RECEIVED",
    `<h2>Subscription Received! 🎉</h2>
     <p>Hi ${sub.firstName}, thank you for subscribing to <strong>${sub.estateName}</strong>. Your application has been received and is under review.</p>`,
    `${dataRows([
      ["Estate", sub.estateName],
      ["Plot Type", sub.plotType],
      ["Plot Size", sub.plotSize],
      ["No. of Plots", String(sub.numberOfPlots)],
      ["Payment Plan", sub.paymentPlan],
      ["Total Amount", amount],
      ["Status", "Under Review"],
    ])}
    <div class="notice"><p>Our team will review your application and contact you within <strong>24–48 hours</strong>. Keep your phone reachable!</p></div>
    <div class="btn-wrapper"><a href="https://kemchutahomesltd.com/client/portal" class="btn">Track Your Application</a></div>`,
  );

  await Promise.allSettled([
    sendEmail({
      to: ADMIN_EMAIL(),
      subject: `New Subscription: ${sub.estateName} — ${fullName}`,
      html: adminHtml,
    }),
    sendEmail({
      to: sub.email,
      subject: `Subscription Received — ${sub.estateName}`,
      html: clientHtml,
    }),
  ]);
}

/* ── 4. SUBSCRIPTION STATUS CHANGED ─────────────────────────────────────── */
export async function notifySubscriptionStatusChanged(sub) {
  const amount = fmtNGN(sub.totalAmount);

  const messages = {
    reviewed: {
      subject: `Application Under Review — ${sub.estateName}`,
      heading: "Your Application is Being Reviewed 🔍",
      body: `Hi ${sub.firstName}, your subscription for <strong>${sub.estateName}</strong> is currently under review by our team. We'll update you shortly.`,
    },
    approved: {
      subject: `🎉 Subscription Approved — ${sub.estateName}`,
      heading: "Congratulations! Subscription Approved 🎉",
      body: `Hi ${sub.firstName}, great news! Your subscription for <strong>${sub.estateName}</strong> has been <strong>approved</strong>! Our team will contact you within 24 hours to discuss next steps and payment arrangements.`,
    },
    rejected: {
      subject: `Update on Your Subscription — ${sub.estateName}`,
      heading: "Subscription Update",
      body: `Hi ${sub.firstName}, unfortunately your subscription for <strong>${sub.estateName}</strong> could not be processed at this time. Please contact our team to discuss alternative options — we're here to help.`,
    },
  };

  const msg = messages[sub.status];
  if (!msg) return;

  const html = baseHtml(
    sub.status.toUpperCase(),
    `<h2>${msg.heading}</h2><p>${msg.body}</p>`,
    `${dataRows([
      ["Estate", sub.estateName],
      ["Plot", `${sub.plotType} — ${sub.plotSize} × ${sub.numberOfPlots}`],
      ["Total Amount", amount],
      ["Status", sub.status.charAt(0).toUpperCase() + sub.status.slice(1)],
    ])}
    <div class="btn-wrapper"><a href="https://kemchutahomesltd.com/client/portal" class="btn">View Application</a></div>`,
  );

  await sendEmail({ to: sub.email, subject: msg.subject, html });
}

/* ── 5. INSPECTION REMINDER (cron — day before) ──────────────────────────── */
export async function sendInspectionReminder(inspection) {
  const { firstName, email, estateName, inspectionDate } = inspection;
  const dateStr = fmtDate(inspectionDate);

  const html = baseHtml(
    "REMINDER",
    `<h2>Your Inspection is Tomorrow! 📅</h2>
     <p>Hi ${firstName}, just a friendly reminder that your site visit for <strong>${estateName}</strong> is scheduled for tomorrow.</p>`,
    `${dataRows([
      ["Estate", estateName],
      ["Date", dateStr],
    ])}
    <div class="notice"><p>Please arrive 10 minutes early and bring a valid ID. Looking forward to seeing you!</p></div>
    <div class="btn-wrapper"><a href="https://kemchutahomesltd.com/contact" class="btn">Contact Us</a></div>`,
  );

  await sendEmail({
    to: email,
    subject: `Reminder: Inspection Tomorrow — ${estateName}`,
    html,
  });
}

/* ── 6. POST-INSPECTION FOLLOW-UP (cron — 3 days after, no subscription) ── */
export async function sendPostInspectionFollowUp(inspection) {
  const { firstName, email, estateName } = inspection;

  const html = baseHtml(
    "FOLLOW UP",
    `<h2>How Was Your Visit? 🏡</h2>
     <p>Hi ${firstName}, we hope you enjoyed your visit to <strong>${estateName}</strong>! We'd love to help you take the next step toward owning your piece of land.</p>`,
    `<p>Our team is available to answer any questions and walk you through our flexible payment plans. Don't miss your chance — plots are selling fast!</p>
    <div class="btn-wrapper"><a href="https://kemchutahomesltd.com/developments" class="btn">View Payment Plans</a></div>`,
  );

  await sendEmail({
    to: email,
    subject: `Still Interested in ${estateName}? Let's Talk 🏡`,
    html,
  });
}

/* ── 7. PAYMENT REMINDER (cron — monthly for installment plans) ──────────── */
export async function sendPaymentReminder(sub) {
  const amount = fmtNGN(sub.totalAmount);

  const html = baseHtml(
    "PAYMENT REMINDER",
    `<h2>Payment Reminder 💳</h2>
     <p>Hi ${sub.firstName}, this is a friendly reminder about your outstanding installment payment for <strong>${sub.estateName}</strong>.</p>`,
    `${dataRows([
      ["Estate", sub.estateName],
      ["Total Amount", amount],
      ["Plan", sub.paymentPlan],
    ])}
    <div class="notice"><p>Please contact our team to arrange your next payment and avoid any delays in your land allocation.</p></div>
    <div class="btn-wrapper"><a href="https://kemchutahomesltd.com/contact" class="btn">Contact Us</a></div>`,
  );

  await sendEmail({
    to: sub.email,
    subject: `Payment Reminder — ${sub.estateName}`,
    html,
  });
}

/* ── 8. REALTOR WELCOME (email only — existing sendWelcomeEmail still fires) */
// The existing sendWelcomeEmail() in utils/email.js already handles realtor
// welcome emails. notifyRealtorWelcome is kept as a no-op stub so the import
// in realtor.controller.js doesn't break. SMS/WhatsApp will be added here later.
export async function notifyRealtorWelcome({
  firstName,
  phone,
  referralCode,
  referralLink,
}) {
  // SMS and WhatsApp welcome messages will be added here when SMS is integrated.
  // Email welcome is already handled by sendWelcomeEmail() in utils/email.js.
  return { success: true, channel: "email_via_sendWelcomeEmail" };
}
