import React, { useState } from "react";
import { scheduleEmails } from "../api";

interface ComposeEmailProps {
  userEmail: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const ComposeEmail: React.FC<ComposeEmailProps> = ({ userEmail, onClose, onSuccess }) => {
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [emailCount, setEmailCount] = useState(0);
  const [delay, setDelay] = useState(0);
  const [hourlyLimit, setHourlyLimit] = useState(0);
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0,16)); // default now
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (!selectedFile) {
      setEmailCount(0);
      return;
    }

    // Count valid emails for display
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const emails = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.includes("@"));
      setEmailCount(emails.length);
    };
    reader.readAsText(selectedFile);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if ((!toEmail && !file) || !subject || !body || !startTime) {
      alert("Please fill all required fields and/or upload a CSV");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("body", body);
      formData.append("senderEmail", userEmail);
      if (toEmail) formData.append("to", toEmail); // single recipient
      if (file) formData.append("file", file);     // CSV file
      formData.append("delay", delay.toString());
      formData.append("hourlyLimit", hourlyLimit.toString());
      formData.append("startTime", new Date(startTime).toISOString());

      await scheduleEmails(formData);

      alert("Emails scheduled successfully!");

      // Reset form
      setToEmail("");
      setSubject("");
      setBody("");
      setFile(null);
      setEmailCount(0);
      setDelay(0);
      setHourlyLimit(0);
      setStartTime(new Date().toISOString().slice(0,16));
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to schedule emails. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: "600px",
          background: "#fff",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Compose New Email</h2>

        {/* From */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.85rem", color: "#555" }}>From</label>
          <select
            value={userEmail}
            disabled
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value={userEmail}>{userEmail}</option>
          </select>
        </div>

        {/* To + File Upload */}
        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <input
            type="email"
            placeholder="Recipient Email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            style={{
              width: "70%",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
          <label
            style={{ color: "#4f46e5", cursor: "pointer", marginLeft: "1rem" }}
          >
            Upload List
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {emailCount > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            {emailCount} email address{emailCount > 1 ? "es" : ""} detected
          </div>
        )}

        {/* Subject */}
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        {/* Start Time, Delay & Hourly Limit */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="number"
            placeholder="Delay between emails (sec)"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="number"
            placeholder="Hourly Limit"
            value={hourlyLimit}
            onChange={(e) => setHourlyLimit(Number(e.target.value))}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Body */}
        <textarea
          placeholder="Type your email..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 1rem",
              background: "#ccc",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "0.5rem 1rem",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Scheduling..." : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;
