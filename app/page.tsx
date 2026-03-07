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
  const [darkMode, setDarkMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedBusinessName = localStorage.getItem("businessName");
    const savedHours = localStorage.getItem("hours");
    const savedBusinessType = localStorage.getItem("businessType");
    const savedTheme = localStorage.getItem("darkMode");
    if (savedBusinessName) setBusinessName(savedBusinessName);
    if (savedHours) setHours(savedHours);
    if (savedBusinessType) setBusinessType(savedBusinessType);
    if (savedTheme === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("businessName", businessName);
    localStorage.setItem("hours", hours);
    localStorage.setItem("businessType", businessType);
    localStorage.setItem("darkMode", darkMode.toString());
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [businessName, hours, businessType, darkMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    document.documentElement.style.setProperty("--bg-color", darkMode ? "#121212" : "#ffffff");
    document.documentElement.style.setProperty("--text-color", darkMode ? "#ffffff" : "#000000");
    document.documentElement.style.setProperty("--input-bg", darkMode ? "#333" : "#fff");
    document.documentElement.style.setProperty("--border-color", darkMode ? "#555" : "#ccc");
    document.documentElement.style.setProperty("--chat-bg", darkMode ? "#1e1e1e" : "#f9f9f9");
    document.documentElement.style.setProperty("--user-bg", darkMode ? "#333" : "#e3f2fd");
    document.documentElement.style.setProperty("--assistant-bg", darkMode ? "#2e7d32" : "#dcf8c6");
  }, [darkMode]);

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
      <style>{`
        :root {
          --bg-color: #ffffff;
          --text-color: #000000;
          --input-bg: #fff;
          --border-color: #ccc;
          --chat-bg: #f9f9f9;
          --user-bg: #e3f2fd;
          --assistant-bg: #dcf8c6;
        }
        body {
          background-color: var(--bg-color);
          color: var(--text-color);
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        @media (max-width: 768px) {
          main {
            padding: 10px !important;
            max-width: 100% !important;
          }
          .business-inputs {
            flex-direction: column !important;
          }
          .quick-buttons {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .input-area {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .input-area input {
            width: 100% !important;
          }
        }
      `}</style>
      <main style={{ padding: "20px", maxWidth: "700px", margin: "auto", minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
            Caribbean WhatsApp Reply AI
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "8px 12px",
              background: "var(--input-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              cursor: "pointer",
              color: "var(--text-color)"
            }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <p style={{ marginBottom: "20px" }}>
          Chat with the AI assistant for your business.
        </p>

        {/* Business Inputs */}
        <div className="business-inputs" style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ color: "var(--text-color)" }}>Business Name</label>
            <input
              type="text"
              placeholder="Example: Orvayn Electronics"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "4px",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "var(--input-bg)",
                color: "var(--text-color)"
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ color: "var(--text-color)" }}>Business Hours</label>
            <input
              type="text"
              placeholder="Example: 9am – 6pm"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "4px",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "var(--input-bg)",
                color: "var(--text-color)"
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ color: "var(--text-color)" }}>Business Type</label>
            <input
              type="text"
              placeholder="Example: Phone Repairs"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "4px",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "var(--input-bg)",
                color: "var(--text-color)"
              }}
            />
          </div>
        </div>
        {saved && <p style={{ color: "green", fontSize: "12px", marginBottom: "10px" }}>Saved!</p>}

        {/* Quick Reply Buttons */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontWeight: "bold", marginBottom: "8px", color: "var(--text-color)" }}>Quick Start</p>
          <div className="quick-buttons" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={() => setMessage("Are you open today?")} style={{ padding: "6px 10px", border: "1px solid var(--border-color)", borderRadius: "4px", background: "var(--input-bg)", cursor: "pointer", color: "var(--text-color)" }}>Are you open today?</button>
            <button onClick={() => setMessage("How much is this item?")} style={{ padding: "6px 10px", border: "1px solid var(--border-color)", borderRadius: "4px", background: "var(--input-bg)", cursor: "pointer", color: "var(--text-color)" }}>Price inquiry</button>
            <button onClick={() => setMessage("Where are you located?")} style={{ padding: "6px 10px", border: "1px solid var(--border-color)", borderRadius: "4px", background: "var(--input-bg)", cursor: "pointer", color: "var(--text-color)" }}>Location request</button>
            <button onClick={() => setMessage("Do you have this item available?")} style={{ padding: "6px 10px", border: "1px solid var(--border-color)", borderRadius: "4px", background: "var(--input-bg)", cursor: "pointer", color: "var(--text-color)" }}>Item availability</button>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px", overflowY: "auto", marginBottom: "10px", backgroundColor: "var(--chat-bg)" }}>
          {conversation.length === 0 && <p style={{ color: "#999", textAlign: "center" }}>Start a conversation...</p>}
          {conversation.map((msg, index) => (
            <div key={index} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-start" : "flex-end", marginBottom: "10px" }}>
              <div style={{
                background: msg.role === "user" ? "var(--user-bg)" : "var(--assistant-bg)",
                padding: "10px 14px",
                borderRadius: "10px",
                maxWidth: "70%",
                fontSize: "14px",
                lineHeight: "1.4",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                color: msg.role === "user" ? "var(--text-color)" : "#000"
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <p style={{ textAlign: "center", color: "#666" }}>Typing...</p>}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid var(--border-color)",
              borderRadius: "20px",
              fontSize: "14px",
              backgroundColor: "var(--input-bg)",
              color: "var(--text-color)"
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
      <footer style={{ textAlign: "center", padding: "10px", fontSize: "12px", color: "#666", borderTop: "1px solid var(--border-color)", marginTop: "20px", backgroundColor: "var(--bg-color)" }}>
        © 2026 Orvayn Digital. All rights reserved. | Aleem's Artificial Intelligence Labs
      </footer>
    </>
  );
}