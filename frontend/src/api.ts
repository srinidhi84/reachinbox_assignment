import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

// Types
export interface ScheduledEmail {
  id: number;
  to: string;
  subject: string;
  body: string;
  senderEmail: string;
  status: string;
  createdAt: string;
  startTime?: string; // optional field
}

export interface SentEmail {
  id: number;
  toEmail: string;
  subject: string;
  body: string;
  senderEmail: string;
  status: string;
  createdAt: string;
}

// Fetch scheduled emails
export const fetchScheduledEmails = async (): Promise<ScheduledEmail[]> => {
  try {
    const res = await axios.get(`${API_BASE}/emails`);
    return res.data;
  } catch (err) {
    console.error("Error fetching scheduled emails:", err);
    return [];
  }
};

// Fetch sent emails
export const fetchSentEmails = async (): Promise<SentEmail[]> => {
  try {
    const res = await axios.get(`${API_BASE}/sent-emails`);
    return res.data;
  } catch (err) {
    console.error("Error fetching sent emails:", err);
    return [];
  }
};

// ----------------- NEW FUNCTION -----------------
// Schedule new emails (used by ComposeEmail modal)
export const scheduleEmails = async (formData: FormData): Promise<void> => {
  try {
    // formData should include: subject, body, senderEmail, to, file, delay, hourlyLimit, startTime
    await axios.post(`${API_BASE}/schedule-emails`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (err) {
    console.error("Error scheduling emails:", err);
    throw err;
  }
};
