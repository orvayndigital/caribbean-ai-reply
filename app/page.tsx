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
          border: "1px solid#ccc",
        }}
      />
{/* QUICK REPLY BUTTONS */}
<div style={{ marginTop: "15px", marginBottom: "20px" }}>
  <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
    Quick Reply Scenarios
  </p>

  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

    <button
      onClick={() => setMessage("Are you open today?")}
      style={{
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        background: "#f5f5f5",
        cursor: "pointer"
      }}
    >
      Are you open today?
    </button>

    <button
      onClick={() => setMessage("How much is this item?")}
      style={{
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        background: "#f5f5f5",
        cursor: "pointer"
      }}
    >
      Price inquiry
    </button>

    <button
      onClick={() => setMessage("Where are you located?")}
      style={{
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        background: "#f5f5f5",
        cursor: "pointer"
      }}
    >
      Location request
    </button>

    <button
      onClick={() => setMessage("Do you have this item available?")}
      style={{
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        background: "#f5f5f5",
        cursor: "pointer"
      }}
    >
      Item availability
    </button>

  </div>
</div>

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
  <div style={{ marginTop: "30px" }}>

    <h3 style={{ marginBottom: "15px" }}>Suggested Reply</h3>

    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "15px"
      }}
    >
      {result
  .split(/\d\.\s/)
  .filter(Boolean)
  .map((reply, index) => (
    <div
      key={index}
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "10px"
      }}
    >
      <div
        style={{
          background: "#dcf8c6",
          padding: "12px 16px",
          borderRadius: "10px",
          maxWidth: "70%",
          fontSize: "16px",
          lineHeight: "1.4",
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)"
        }}
      >
        {reply.trim()}
      </div>
    </div>
  ))}
    </div>

    <button
      onClick={copyReply}
      style={{
        padding: "10px 16px",
        background: "#25D366",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
      }}
    >
      Copy Reply
    </button>

  </div>
)}
    </main>
  );
}