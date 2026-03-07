"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [hours, setHours] = useState("");
  const [businessType, setBusinessType] = useState("");

  async function generateReply() {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/reply", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message,
    businessName,
    hours,
    businessType,
  }),
});

      const data = await res.json();
      setResult(data.reply || "No reply generated.");
    } catch (error) {
      setResult("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  async function copyReply() {
    await navigator.clipboard.writeText(result);
    alert("Reply copied");
  }

  return (
    <main style={{ padding: "40px", maxWidth: "700px", margin: "auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "10px" }}>
        Caribbean WhatsApp Reply AI
      </h1>

      <p style={{ marginBottom: "20px" }}>
        Paste a customer message and get a fast WhatsApp-style reply.
      </p>

      <div style={{ marginBottom: "20px" }}>
  <label>Business Name</label>
  <input
    type="text"
    placeholder="Example: Orvayn Electronics"
    value={businessName}
    onChange={(e) => setBusinessName(e.target.value)}
    style={{
      width: "100%",
      padding: "12px",
      marginTop: "6px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      fontSize: "16px",
      boxSizing: "border-box"
    }}
  />
</div>

<div style={{ marginBottom: "20px" }}>
  <label>Business Hours</label>
  <input
    type="text"
    placeholder="Example: 9am – 6pm"
    value={hours}
    onChange={(e) => setHours(e.target.value)}
    style={{
      width: "100%",
      padding: "12px",
      marginTop: "6px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      fontSize: "16px",
      boxSizing: "border-box"
    }}
  />
</div>

<div style={{ marginBottom: "20px" }}>
  <label>Business Type</label>
  <input
    type="text"
    placeholder="Example: Phone Repairs, Restaurant, Salon"
    value={businessType}
    onChange={(e) => setBusinessType(e.target.value)}
    style={{
      width: "100%",
      padding: "12px",
      marginTop: "6px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      fontSize: "16px",
      boxSizing: "border-box"
    }}
  />
</div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Example: Allyuh open today?"
        style={{
          width: "100%",
          height: "140px",
          padding: "12px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={generateReply}
        disabled={loading || !message.trim()}
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          background: loading ? "#666" : "black",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Reply"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            background: "#f9f9f9",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>Suggested Reply</h3>
          <p style={{ whiteSpace: "pre-wrap", marginBottom: "15px" }}>{result}</p>

          <button
            onClick={copyReply}
            style={{
              padding: "10px 16px",
              background: "#111",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Copy Reply
          </button>
        </div>
      )}
    </main>
  );
}