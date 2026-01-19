import { Router, Request, Response } from "express";
import csv from "csv-parser";
import { Readable } from "stream";
import { upload } from "../middlewares/upload";
import { AppDataSource } from "../config/db";
import { ScheduledEmail } from "../entities/ScheduledEmail";
import { SentEmail } from "../entities/SentEmail";
import { emailQueue } from "../queue/emailQueue";

const router = Router();

/**
 * POST /schedule-emails
 * Upload CSV or single email and schedule emails with startTime, delay, hourlyLimit
 */
router.post(
  "/schedule-emails",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const { subject, body, senderEmail, to, delay, hourlyLimit, startTime } =
        req.body;

      // Validation
      if (!subject || !body || !senderEmail || (!to && !req.file) || !startTime) {
        return res.status(400).json({
          message:
            "subject, body, senderEmail, startTime, and at least one recipient (to or file) are required",
        });
      }

      // Collect recipients
      let emails: string[] = [];

      // Single manual email
      if (to) emails.push(to);

      // File upload
      if (req.file) {
        const buffer = req.file.buffer;
        const mimetype = req.file.mimetype;

        // If plain text file
        if (mimetype === "text/plain") {
          const text = buffer.toString("utf-8");
          text.split(/\r?\n/).forEach((line) => {
            const email = line.trim();
            if (email.includes("@")) emails.push(email);
          });
        } else {
          // Assume CSV
          const stream = Readable.from(buffer);
          await new Promise<void>((resolve, reject) => {
            stream
              .pipe(
                csv({
                  headers: false, // treat first line as data if no headers
                  skipLines: 0,
                })
              )
              .on("data", (row) => {
                // Use first column if no headers
                const emailAddress =
                  row.email || row.Email || row[Object.keys(row)[0]];
                if (emailAddress && emailAddress.includes("@")) {
                  emails.push(emailAddress.trim());
                }
              })
              .on("end", resolve)
              .on("error", reject);
          });
        }
      }

      if (emails.length === 0) {
        return res.status(400).json({ message: "No valid emails found" });
      }

      const repo = AppDataSource.getRepository(ScheduledEmail);

      // Schedule emails
      for (const email of emails) {
        const scheduledEmail = repo.create({
          to: email,
          subject,
          body,
          senderEmail,
          startTime: new Date(startTime),
          delay: Number(delay) || 0,
          hourlyLimit: Number(hourlyLimit) || 0,
          status: "scheduled",
        });

        await repo.save(scheduledEmail);

        // Add job to queue
        await emailQueue.add("send-email", {
          to: email,
          subject,
          body,
          senderEmail,
          startTime: new Date(startTime),
          delay: Number(delay) || 0,
          hourlyLimit: Number(hourlyLimit) || 0,
        });
      }

      console.log(`✅ Scheduled ${emails.length} emails`);
      res.json({ message: `${emails.length} emails scheduled` });
    } catch (err) {
      console.error("Error scheduling emails:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * GET /emails
 * Fetch all scheduled emails
 */
router.get("/emails", async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(ScheduledEmail);
    const emails = await repo.find({ order: { id: "ASC" } });
    res.json(emails);
  } catch (err) {
    console.error("Error fetching emails:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /sent-emails
 * Fetch all sent emails
 */
router.get("/sent-emails", async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(SentEmail);
    const sentEmails = await repo.find({ order: { id: "ASC" } });
    res.json(sentEmails);
  } catch (err) {
    console.error("Error fetching sent emails:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
