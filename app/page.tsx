"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  cost: string;
  imageUrl?: string;
};

type DeliveryLocation = {
  id: string;
  name: string;
  cost: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryLocations, setDeliveryLocations] = useState<DeliveryLocation[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: "", description: "", cost: "" });
  const [newLocation, setNewLocation] = useState({ name: "", cost: "" });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingLocation, setEditingLocation] = useState<DeliveryLocation | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedBusinessName = localStorage.getItem("businessName");
    const savedHours = localStorage.getItem("hours");
    const savedBusinessType = localStorage.getItem("businessType");
    const savedTheme = localStorage.getItem("darkMode");
    const savedProducts = localStorage.getItem("products");
    const savedLocations = localStorage.getItem("deliveryLocations");
    
    if (savedBusinessName) setBusinessName(savedBusinessName);
    if (savedHours) setHours(savedHours);
    if (savedBusinessType) setBusinessType(savedBusinessType);
    if (savedTheme === "true") setDarkMode(true);
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedLocations) setDeliveryLocations(JSON.parse(savedLocations));
  }, []);

  useEffect(() => {
    localStorage.setItem("businessName", businessName);
    localStorage.setItem("hours", hours);
    localStorage.setItem("businessType", businessType);
    localStorage.setItem("darkMode", darkMode.toString());
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("deliveryLocations", JSON.stringify(deliveryLocations));
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [businessName, hours, businessType, darkMode, products, deliveryLocations]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    document.documentElement.style.setProperty("--bg-color", darkMode ? "#1a1a1a" : "#f8f9fa");
    document.documentElement.style.setProperty("--text-color", darkMode ? "#e0e0e0" : "#1a1a1a");
    document.documentElement.style.setProperty("--input-bg", darkMode ? "#2a2a2a" : "#ffffff");
    document.documentElement.style.setProperty("--border-color", darkMode ? "#444" : "#e0e0e0");
    document.documentElement.style.setProperty("--chat-bg", darkMode ? "#252525" : "#ffffff");
    document.documentElement.style.setProperty("--user-bg", darkMode ? "#0066cc" : "#0066cc");
    document.documentElement.style.setProperty("--assistant-bg", darkMode ? "#333" : "#e8f0fe");
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

  function addProduct() {
    if (!newProduct.name || !newProduct.cost) {
      alert("Product name and cost are required");
      return;
    }
    
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { 
        id: editingProduct.id,
        name: newProduct.name || '',
        description: newProduct.description || '',
        cost: newProduct.cost || '',
        imageUrl: newProduct.imageUrl
      } : p));
      setEditingProduct(null);
    } else {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name || '',
        description: newProduct.description || '',
        cost: newProduct.cost || '',
        imageUrl: newProduct.imageUrl,
      };
      setProducts([...products, product]);
    }
    
    setNewProduct({ name: "", description: "", cost: "" });
    setShowProductForm(false);
  }

  function deleteProduct(id: string) {
    if (confirm("Delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  }

  function startEditProduct(product: Product) {
    setNewProduct(product);
    setEditingProduct(product);
    setShowProductForm(true);
  }

  function addLocation() {
    if (!newLocation.name || !newLocation.cost) {
      alert("Location name and cost are required");
      return;
    }

    if (editingLocation) {
      setDeliveryLocations(deliveryLocations.map(l => l.id === editingLocation.id ? { ...newLocation, id: editingLocation.id } : l));
      setEditingLocation(null);
    } else {
      const location: DeliveryLocation = {
        id: Date.now().toString(),
        name: newLocation.name,
        cost: newLocation.cost,
      };
      setDeliveryLocations([...deliveryLocations, location]);
    }

    setNewLocation({ name: "", cost: "" });
    setShowLocationForm(false);
  }

  function deleteLocation(id: string) {
    if (confirm("Delete this delivery location?")) {
      setDeliveryLocations(deliveryLocations.filter(l => l.id !== id));
    }
  }

  function startEditLocation(location: DeliveryLocation) {
    setNewLocation(location);
    setEditingLocation(location);
    setShowLocationForm(true);
  }

  return (
    <>
      <style>{`
        :root {
          --bg-color: #f8f9fa;
          --text-color: #1a1a1a;
          --input-bg: #ffffff;
          --border-color: #e0e0e0;
          --chat-bg: #ffffff;
          --user-bg: #0066cc;
          --assistant-bg: #e8f0fe;
        }
        body {
          background-color: var(--bg-color);
          color: var(--text-color);
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
        }
        @media (max-width: 768px) {
          main {
            padding: 12px !important;
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
          .input-area input,
          .input-area button {
            width: 100% !important;
          }
        }
      `}</style>
      <main style={{ padding: "20px", maxWidth: "700px", margin: "auto", minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#0066cc" }}>
            Caribbean Chat Pro
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

        <p style={{ marginBottom: "20px", color: "#666", fontSize: "14px" }}>
          Professional AI-powered chat management for Caribbean businesses.
        </p>

        <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>

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

        {/* Products Section */}
        <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: 0, color: "var(--text-color)", fontSize: "16px", fontWeight: "600" }}>Products</h3>
            <button
              onClick={() => {
                setShowProductForm(!showProductForm);
                setEditingProduct(null);
                setNewProduct({ name: "", description: "", cost: "", imageUrl: "" });
              }}
              style={{
                padding: "6px 12px",
                background: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600"
              }}
            >
              {showProductForm ? "Cancel" : "+ Add Product"}
            </button>
          </div>

          {showProductForm && (
            <div style={{ background: "var(--input-bg)", padding: "12px", borderRadius: "6px", marginBottom: "12px", border: "1px solid var(--border-color)" }}>
              <input
                type="text"
                placeholder="Product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-color)",
                  boxSizing: "border-box"
                }}
              />
              <input
                type="text"
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-color)",
                  boxSizing: "border-box"
                }}
              />
              <input
                type="text"
                placeholder="Cost (e.g., $15.99)"
                value={newProduct.cost}
                onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-color)",
                  boxSizing: "border-box"
                }}
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={newProduct.imageUrl}
                onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-color)",
                  boxSizing: "border-box"
                }}
              />
              <button
                onClick={addProduct}
                style={{
                  padding: "8px 12px",
                  background: "#0066cc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  width: "100%"
                }}
              >
                {editingProduct ? "Update Product" : "Save Product"}
              </button>
            </div>
          )}

          {products.length === 0 ? (
            <p style={{ color: "#999", fontSize: "14px" }}>No products added yet</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
              {products.map((product) => (
                <div key={product.id} style={{ background: "var(--input-bg)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "4px", marginBottom: "8px" }} />
                  )}
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: "var(--text-color)" }}>{product.name}</h4>
                  {product.description && <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>{product.description}</p>}
                  <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#0066cc" }}>{product.cost}</p>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => startEditProduct(product)}
                      style={{
                        flex: 1,
                        padding: "4px",
                        background: "#444",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      style={{
                        flex: 1,
                        padding: "4px",
                        background: "#666",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Locations Section */}
        <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: 0, color: "var(--text-color)", fontSize: "16px", fontWeight: "600" }}>Delivery Locations</h3>
            <button
              onClick={() => {
                setShowLocationForm(!showLocationForm);
                setEditingLocation(null);
                setNewLocation({ name: "", cost: "" });
              }}
              style={{
                padding: "6px 12px",
                background: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600"
              }}
            >
              {showLocationForm ? "Cancel" : "+ Add Location"}
            </button>
          </div>

          {showLocationForm && (
            <div style={{ background: "var(--input-bg)", padding: "12px", borderRadius: "6px", marginBottom: "12px", border: "1px solid var(--border-color)" }}>
              <input
                type="text"
                placeholder="Location name (e.g., Downtown, Uptown)"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-color)",
                  boxSizing: "border-box"
                }}
              />
              <input
                type="text"
                placeholder="Delivery cost (e.g., $5.00)"
                value={newLocation.cost}
                onChange={(e) => setNewLocation({ ...newLocation, cost: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-color)",
                  boxSizing: "border-box"
                }}
              />
              <button
                onClick={addLocation}
                style={{
                  padding: "8px 12px",
                  background: "#0066cc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  width: "100%"
                }}
              >
                {editingLocation ? "Update Location" : "Save Location"}
              </button>
            </div>
          )}

          {deliveryLocations.length === 0 ? (
            <p style={{ color: "#999", fontSize: "14px" }}>No delivery locations added yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {deliveryLocations.map((location) => (
                <div key={location.id} style={{ background: "var(--input-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: "var(--text-color)" }}>{location.name}</h4>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#0066cc" }}>Delivery: {location.cost}</p>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => startEditLocation(location)}
                      style={{
                        padding: "6px 10px",
                        background: "#444",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteLocation(location.id)}
                      style={{
                        padding: "6px 10px",
                        background: "#666",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                color: msg.role === "user" ? "white" : (darkMode ? "#e0e0e0" : "#1a1a1a")
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <p style={{ textAlign: "center", color: "#666" }}>Typing...</p>}
          <div ref={chatEndRef} />
        </div>

        </div>

        {/* Input Area */}
        <div className="input-area" style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "15px" }}>
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
              background: loading ? "#999" : "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Send
          </button>
          <button
            onClick={clearChat}
            style={{
              padding: "10px 12px",
              background: "#666",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Clear
          </button>
          {conversation.some(m => m.role === "assistant") && (
            <button
              onClick={copyLastReply}
              style={{
                padding: "10px 12px",
                background: "#555",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "600"
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