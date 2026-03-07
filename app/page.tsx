"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [hours, setHours] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [saved, setSaved] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedBusinessName = localStorage.getItem("businessName");
    const savedHours = localStorage.getItem("hours");
    const savedBusinessType = localStorage.getItem("businessType");
    if (savedBusinessName) setBusinessName(savedBusinessName);
    if (savedHours) setHours(savedHours);
    if (savedBusinessType) setBusinessType(savedBusinessType);
  }, []);

  useEffect(() => {
    localStorage.setItem("businessName", businessName);
    localStorage.setItem("hours", hours);
    localStorage.setItem("businessType", businessType);
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [businessName, hours, businessType]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  async function sendMessage() {
    if (!message.trim()) return;

    const userMessage: Message = { role: "user", content: message };
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);
    setMessage("");
    setLoading(true);

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
          history: conversation,
        }),
      });

      const data = await res.json();
      const assistantMessage: Message = { role: "assistant", content: data.reply };
      setConversation([...newConversation, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { role: "assistant", content: "Something went wrong. Please try again." };
      setConversation([...newConversation, errorMessage]);
    }

    setLoading(false);
  }

  function clearChat() {
    setConversation([]);
  }

  async function copyLastReply() {
    const lastAssistant = conversation.filter(m => m.role === "assistant").pop();
    if (lastAssistant) {
      await navigator.clipboard.writeText(lastAssistant.content);
      alert("Last reply copied");
    }
  }

  return (
    <>
      <main style={{ padding: "20px", maxWidth: "700px", margin: "auto", height: "100vh", display: "flex", flexDirection: "column" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "10px" }}>
          Caribbean WhatsApp Reply AI
        </h1>

        <p style={{ marginBottom: "20px" }}>
          Chat with the AI assistant for your business.
        </p>

        {/* Business Inputs */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label>Business Name</label>
            <input
              type="text"
              placeholder="Example: Orvayn Electronics"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "4px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <label>Business Hours</label>
            <input
              type="text"
              placeholder="Example: 9am – 6pm"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "4px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label>Business Type</label>
            <input
              type="text"
              placeholder="Example: Phone Repairs"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "4px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>
        {saved && <p style={{ color: "green", fontSize: "12px", marginBottom: "10px" }}>Saved!</p>}

        {/* Quick Reply Buttons */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontWeight: "bold", marginBottom: "8px" }}>Quick Start</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={() => setMessage("Are you open today?")} style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", background: "#f5f5f5", cursor: "pointer" }}>Are you open today?</button>
            <button onClick={() => setMessage("How much is this item?")} style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", background: "#f5f5f5", cursor: "pointer" }}>Price inquiry</button>
            <button onClick={() => setMessage("Where are you located?")} style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", background: "#f5f5f5", cursor: "pointer" }}>Location request</button>
            <button onClick={() => setMessage("Do you have this item available?")} style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", background: "#f5f5f5", cursor: "pointer" }}>Item availability</button>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "8px", padding: "10px", overflowY: "auto", marginBottom: "10px", background: "#f9f9f9" }}>
          {conversation.length === 0 && <p style={{ color: "#999", textAlign: "center" }}>Start a conversation...</p>}
          {conversation.map((msg, index) => (
            <div key={index} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-start" : "flex-end", marginBottom: "10px" }}>
              <div style={{
                background: msg.role === "user" ? "#e3f2fd" : "#dcf8c6",
                padding: "10px 14px",
                borderRadius: "10px",
                maxWidth: "70%",
                fontSize: "14px",
                lineHeight: "1.4",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <p style={{ textAlign: "center", color: "#666" }}>Typing...</p>}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "20px",
              fontSize: "14px"
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            style={{
              padding: "10px 16px",
              background: loading ? "#666" : "#25D366",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer"
            }}
          >
            Send
          </button>
          <button
            onClick={clearChat}
            style={{
              padding: "10px 12px",
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer"
            }}
          >
            Clear
          </button>
          {conversation.some(m => m.role === "assistant") && (
            <button
              onClick={copyLastReply}
              style={{
                padding: "10px 12px",
                background: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer"
              }}
            >
              Copy Last
            </button>
          )}
        </div>
      </main>
      <footer style={{ textAlign: "center", padding: "10px", fontSize: "12px", color: "#666", borderTop: "1px solid #ddd", marginTop: "20px" }}>
        © 2026 Orvayn Digital. All rights reserved. | Aleem's Artificial Intelligence Labs
      </footer>
    </>
  );
}