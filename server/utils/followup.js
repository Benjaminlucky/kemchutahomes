/**
 * utils/followUp.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated follow-up scheduler for Kemchuta Homes.
 * Uses node-cron to run scheduled jobs at defined intervals.
 *
 * Jobs:
 *   1. Daily 8:00 AM  — Inspection reminders (confirmed inspections tomorrow)
 *   2. Daily 9:00 AM  — Post-inspection follow-up (completed, no subscription, 3 days later)
 *   3. Daily 10:00 AM — Payment reminders (approved installment subscriptions > 30 days old)
 *
 * Usage in index.js:
 *   import { startScheduler } from "./utils/followUp.js";
 *   startScheduler();
 *
 * Required env vars: all the same ones used by notifications.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import cron from "node-cron";
import Inspection from "../models/inspection.model.js";
import Subscription from "../models/Subscription.model.js";
import {
  sendInspectionReminder,
  sendPostInspectionFollowUp,
  sendPaymentReminder,
} from "./notifications.js";

let schedulerStarted = false;

export function startScheduler() {
  if (schedulerStarted) return; // prevent double-start in dev hot-reload
  schedulerStarted = true;

  console.log("📅 Follow-up scheduler started");

  // ── JOB 1: Inspection reminders — daily at 08:00 ──────────────────────────
  // Finds all CONFIRMED inspections whose date is TOMORROW and sends reminders.
  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log("⏰ [Cron] Running inspection reminder job");
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
        const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

        const inspections = await Inspection.find({
          status: "confirmed",
          inspectionDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
        }).lean();

        console.log(`📋 Found ${inspections.length} inspection(s) to remind`);

        for (const insp of inspections) {
          await sendInspectionReminder(insp).catch((err) =>
            console.error(`Reminder failed for ${insp._id}:`, err.message),
          );
        }
      } catch (err) {
        console.error("❌ Inspection reminder job failed:", err.message);
      }
    },
    { timezone: "Africa/Lagos" },
  );

  // ── JOB 2: Post-inspection follow-up — daily at 09:00 ────────────────────
  // Finds COMPLETED inspections from 3 days ago whose email has no subscription.
  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("⏰ [Cron] Running post-inspection follow-up job");
      try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const threeDaysAgoStart = new Date(threeDaysAgo.setHours(0, 0, 0, 0));
        const threeDaysAgoEnd = new Date(
          threeDaysAgo.setHours(23, 59, 59, 999),
        );

        // Completed inspections from exactly 3 days ago
        const completedInspections = await Inspection.find({
          status: "completed",
          updatedAt: { $gte: threeDaysAgoStart, $lte: threeDaysAgoEnd },
        }).lean();

        console.log(
          `📋 Found ${completedInspections.length} completed inspection(s) to follow up`,
        );

        for (const insp of completedInspections) {
          // Check if this person has subscribed
          const hasSub = await Subscription.exists({ email: insp.email });
          if (hasSub) {
            console.log(`  ↳ ${insp.email} already subscribed — skip`);
            continue;
          }
          await sendPostInspectionFollowUp(insp).catch((err) =>
            console.error(`Follow-up failed for ${insp._id}:`, err.message),
          );
        }
      } catch (err) {
        console.error("❌ Post-inspection follow-up job failed:", err.message);
      }
    },
    { timezone: "Africa/Lagos" },
  );

  // ── JOB 3: Payment reminders — daily at 10:00 ────────────────────────────
  // Finds APPROVED subscriptions with "6 Months Installment" plan that were
  // approved more than 30 days ago. Sends monthly payment reminder.
  // In production you'd track individual payment dates — this is a practical
  // approximation based on approval date modulo 30 days.
  cron.schedule(
    "0 10 * * *",
    async () => {
      console.log("⏰ [Cron] Running payment reminder job");
      try {
        const today = new Date();
        const todayDay = today.getDate();

        // Find all approved installment subscriptions
        const installmentSubs = await Subscription.find({
          status: "approved",
          paymentPlan: "6 Months Installment",
          // Only subscriptions at least 30 days old (i.e. first payment already due)
          updatedAt: {
            $lte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        }).lean();

        console.log(
          `📋 Found ${installmentSubs.length} installment subscription(s) to check`,
        );

        for (const sub of installmentSubs) {
          // Send reminder on the same day-of-month as approval (monthly cadence)
          const approvalDay = new Date(sub.updatedAt).getDate();
          if (approvalDay !== todayDay) continue;

          await sendPaymentReminder(sub).catch((err) =>
            console.error(
              `Payment reminder failed for ${sub._id}:`,
              err.message,
            ),
          );
        }
      } catch (err) {
        console.error("❌ Payment reminder job failed:", err.message);
      }
    },
    { timezone: "Africa/Lagos" },
  );
}
