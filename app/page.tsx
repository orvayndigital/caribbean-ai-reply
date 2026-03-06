"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");

  async function generateReply() {
    const res = await fetch("/api/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setResult(data.reply);
  }

  return (
    <main style={{ padding: "40px", maxWidth: "700px", margin: "auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        Caribbean WhatsApp Reply AI
      </h1>

      <p style={{ marginTop: "10px" }}>
        Paste a customer message and generate a reply.
      </p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Example: Allyuh open today?"
        style={{
          width: "100%",
          height: "120px",
          marginTop: "20px",
          padding: "10px",
        }}
      />

      <button
        onClick={generateReply}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "black",
          color: "white",
        }}
      >
        Generate Reply
      </button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h3>Suggested Reply:</h3>
          <p>{result}</p>
        </div>
      )}
    </main>
  );
}