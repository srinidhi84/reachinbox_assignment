import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSuccess = (credentialResponse: any) => {
    if (!credentialResponse.credential) return;

    const user = jwtDecode<GoogleUser>(credentialResponse.credential);

    // Store user in localStorage
    localStorage.setItem("user", JSON.stringify(user));

    // Redirect to dashboard
    navigate("/dashboard");
  };

  const handleError = () => {
    alert("Google Login Failed");
  };

  const handleEmailLogin = () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    // Fake login for now; store email in localStorage
    const user = { name: email.split("@")[0], email, picture: "" };
    localStorage.setItem("user", JSON.stringify(user));
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8f9fa",
      }}
    >
      <div
        style={{
          width: "360px",
          padding: "2rem",
          border: "1px solid #ddd",
          borderRadius: "12px",
          background: "#fff",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Login</h2>

        {/* Google Login */}
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        <div style={{ margin: "1rem 0", fontSize: "0.9rem", color: "#555" }}>
          OR
        </div>

        {/* Email login */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.75rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleEmailLogin}
          style={{
            width: "100%",
            padding: "0.5rem",
            backgroundColor: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
