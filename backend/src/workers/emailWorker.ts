// src/workers/emailWorker.ts
import { Worker, Job } from "bullmq";
import dotenv from "dotenv";
import { redisConfig } from "../config/redis";
import { sendEmail } from "../services/emailService";
import { AppDataSource } from "../config/db";
import { ScheduledEmail } from "../entities/ScheduledEmail";
import { SentEmail } from "../entities/SentEmail";

dotenv.config();

interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  senderEmail?: string;
}

// Global repositories
let scheduledEmailRepo: ReturnType<typeof AppDataSource.getRepository<ScheduledEmail>>;
let sentEmailRepo: ReturnType<typeof AppDataSource.getRepository<SentEmail>>;
let repoReady = false;

// Initialize database
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected in worker");
    scheduledEmailRepo = AppDataSource.getRepository(ScheduledEmail);
    sentEmailRepo = AppDataSource.getRepository(SentEmail);
    repoReady = true;
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
  });

// Email Worker
export const emailWorker = new Worker<EmailJobData>(
  "email-queue",
  async (job: Job<EmailJobData>) => {
    if (!repoReady) throw new Error("Database not connected yet");

    const { to, subject, body, senderEmail } = job.data;

    // Ensure senderEmail is always a string
    const finalSenderEmail = senderEmail || process.env.DEFAULT_SENDER_EMAIL || "no-reply@example.com";

    console.log(`📤 Sending email to ${to} from ${finalSenderEmail}`);

    try {
      // Send email via Ethereal
      const info = await sendEmail({
        to,
        subject,
        body,
        senderEmail: finalSenderEmail,
      });

      const previewUrl = info ? require("nodemailer").getTestMessageUrl(info) : "N/A";
      console.log(`📧 Email sent! Preview URL: ${previewUrl}`);

      // Update ScheduledEmail status
      await scheduledEmailRepo.update(
        { id: Number(job.id) },
        { status: "sent", sentAt: new Date() }
      );

      // Save into SentEmail table
      await sentEmailRepo.save({
        to,
        subject,
        body,
        senderEmail: finalSenderEmail,
        status: "sent",
        sentAt: new Date(),
      });

      console.log(`✅ Job ${job.id} completed`);
    } catch (err: any) {
      console.error(`❌ Failed to send email to ${to}:`, err?.message || err);

      // Update ScheduledEmail status to failed
      await scheduledEmailRepo.update(
        { id: Number(job.id) },
        { status: "failed", errorMessage: err?.message || "Unknown error" }
      );

      // Save failure to SentEmail
      await sentEmailRepo.save({
        to,
        subject,
        body,
        senderEmail: finalSenderEmail,
        status: "failed",
        errorMessage: err?.message || "Unknown error",
        sentAt: new Date(),
      });

      throw err; // allow BullMQ to retry
    }
  },
  {
    connection: redisConfig,
    limiter: {
      max: Number(process.env.MAX_EMAILS_PER_HOUR) || 5,
      duration: 60 * 60 * 1000, // 1 hour
    },
    concurrency: 1,
  }
);

// Worker events
emailWorker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err?.message || err);
});

emailWorker.on("error", (err) => {
  console.error("❌ Worker error:", err);
});

console.log("✅ Email Worker running");
