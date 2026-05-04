/**
 * utils/followUp.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cron scheduler for all automated tasks.
 *
 * Jobs:
 *   1. 08:00 daily — Payment reminders (3 days before instalment due, overdue, no deposit yet)
 *   2. 09:00 daily — Post-inspection follow-ups (3 days after inspection, no subscription)
 *   3. 02:00 daily — Finalise pending commissions past clawback window
 */

import cron from "node-cron";
import Inspection from "../models/inspection.model.js";
import { sendEmail } from "./notifications.js";
import { sendPaymentReminders } from "../controllers/subscription.controller.js";
import { finalisePendingCommissions } from "./commissionCalculator.js";

export function startScheduler() {
  // ── Job 1: Payment reminders — 8:00am daily ────────────────────────────
  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log("📅 Cron: running payment reminders...");
      try {
        const count = await sendPaymentReminders();
        console.log(`📅 Cron: ${count} payment reminder(s) sent`);
      } catch (err) {
        console.error("📅 Cron payment reminders error:", err.message);
      }
    },
    { timezone: "Africa/Lagos" },
  );

  // ── Job 2: Post-inspection follow-ups — 9:00am daily ──────────────────
  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("📅 Cron: running post-inspection follow-ups...");
      try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const inspections = await Inspection.find({
          status: "completed",
          inspectionDate: { $lte: threeDaysAgo },
          followUpSent: { $ne: true },
        }).lean();

        for (const insp of inspections) {
          const firstName = insp.firstName || "Valued Client";
          const estateName = insp.estateName || "our estate";

          await sendEmail({
            to: insp.email,
            subject: `How was your site visit at ${estateName}?`,
            html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
              <div style="background:linear-gradient(135deg,#3F0C91,#700CEB);padding:28px 32px;border-radius:10px;margin-bottom:24px;">
                <h1 style="color:#fff;margin:0;font-size:20px;font-weight:900;">How Was Your Visit?</h1>
              </div>
              <p style="color:#374151;font-size:15px;line-height:1.75;">
                Dear ${firstName},<br><br>
                We hope you enjoyed your site inspection at <strong>${estateName}</strong>.
                We would love to hear your thoughts and help you take the next step toward land ownership.<br><br>
                Our team is available to answer any questions and guide you through the subscription process.
              </p>
              <div style="text-align:center;margin:24px 0;">
                <a href="${process.env.FRONTEND_URL || "https://kemchutahomesltd.com"}"
                   style="background:#700CEB;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;display:inline-block;">
                  Subscribe Now
                </a>
              </div>
              <p style="color:#374151;font-size:14px;">
                Call us: <strong>+234 800 000 0001</strong> (Lagos) · <strong>+234 800 000 0003</strong> (Asaba)
              </p>
            </div>`,
          }).catch(() => null);

          await Inspection.findByIdAndUpdate(insp._id, { followUpSent: true });
        }

        if (inspections.length > 0) {
          console.log(
            `📅 Cron: ${inspections.length} post-inspection follow-up(s) sent`,
          );
        }
      } catch (err) {
        console.error("📅 Cron post-inspection error:", err.message);
      }
    },
    { timezone: "Africa/Lagos" },
  );

  // ── Job 3: Finalise commissions — 2:00am daily ────────────────────────
  cron.schedule(
    "0 2 * * *",
    async () => {
      try {
        await finalisePendingCommissions();
      } catch (err) {
        console.error("📅 Cron commission finalise error:", err.message);
      }
    },
    { timezone: "Africa/Lagos" },
  );

  console.log("📅 Follow-up scheduler started");
}
