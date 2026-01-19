import React, { useEffect, useState } from "react";
import { fetchScheduledEmails, fetchSentEmails } from "../api";
import ComposeEmail from "../pages/ComposeEmail"; // import modal

interface Email {
  id: number;
  to: string;
  subject: string;
  body: string;
  senderEmail: string;
  status: string;
  createdAt: string;
}

interface User {
  name: string;
  email: string;
  picture: string;
}

const Dashboard: React.FC = () => {
  const [scheduledEmails, setScheduledEmails] = useState<Email[]>([]);
  const [sentEmails, setSentEmails] = useState<Email[]>([]);
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
  const [user, setUser] = useState<User | null>(null);
  const [showCompose, setShowCompose] = useState(false); // modal state

  useEffect(() => {
    // Load user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const loadScheduled = async () => {
      try {
        const data = await fetchScheduledEmails();
        setScheduledEmails(data);
      } catch (err) {
        console.error("Error fetching scheduled emails:", err);
      }
    };

    const loadSent = async () => {
      try {
        const data = await fetchSentEmails();
        setSentEmails(data);
      } catch (err) {
        console.error("Error fetching sent emails:", err);
      }
    };

    loadScheduled();
    loadSent();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const refreshScheduledEmails = async () => {
    try {
      const data = await fetchScheduledEmails();
      setScheduledEmails(data);
    } catch (err) {
      console.error("Error refreshing scheduled emails:", err);
    }
  };

  const renderTable = (emails: Email[]) => (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f0f0f0" }}>
          <th>ID</th>
          <th>To</th>
          <th>Subject</th>
          <th>Body</th>
          <th>Sender</th>
          <th>Status</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        {emails.map((email) => (
          <tr key={email.id} style={{ borderBottom: "1px solid #ddd" }}>
            <td>{email.id}</td>
            <td>{email.to || "-"}</td>
            <td>{email.subject}</td>
            <td>{email.body}</td>
            <td>{email.senderEmail || "-"}</td>
            <td>{email.status}</td>
            <td>{new Date(email.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          background: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {user?.picture && (
            <img
              src={user.picture}
              alt={user.name}
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
          )}
          <div>
            <div style={{ fontWeight: "bold" }}>{user?.name}</div>
            <div style={{ fontSize: "0.85rem", color: "#555" }}>{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <div style={{ padding: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2>Dashboard</h2>
          <button
            style={{
              padding: "0.5rem 1rem",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={() => setShowCompose(true)} // open modal
          >
            Compose New Email
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <button
            onClick={() => setActiveTab("scheduled")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderBottom:
                activeTab === "scheduled" ? "3px solid #4f46e5" : "3px solid transparent",
              background: "transparent",
              cursor: "pointer",
              fontWeight: activeTab === "scheduled" ? "bold" : "normal",
            }}
          >
            Scheduled Emails
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderBottom: activeTab === "sent" ? "3px solid #4f46e5" : "3px solid transparent",
              background: "transparent",
              cursor: "pointer",
              fontWeight: activeTab === "sent" ? "bold" : "normal",
            }}
          >
            Sent Emails
          </button>
        </div>

        {/* Table */}
        <div
          style={{
            background: "#fff",
            padding: "1rem",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          {activeTab === "scheduled" ? renderTable(scheduledEmails) : renderTable(sentEmails)}
        </div>
      </div>

      {/* Compose Email Modal */}
      {showCompose && user && (
        <ComposeEmail
          userEmail={user.email}
          onClose={() => setShowCompose(false)}
          onSuccess={refreshScheduledEmails}
        />
      )}
    </div>
  );
};

export default Dashboard;
