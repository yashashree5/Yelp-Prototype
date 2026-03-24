import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";

const QUICK_ACTIONS = ["Find dinner tonight 🍽️", "Best rated near me ⭐", "Vegan options 🌱", "Romantic dinner 🕯️"];

const CUISINE_IMAGES = {
  Italian: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80",
  Chinese: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&q=80",
  Indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=80",
  Japanese: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&q=80",
  Mexican: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&q=80",
  American: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80",
};

const PRICE_MAP = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };

function formatPricingTier(tier) {
  if (!tier && tier !== 0) return null;
  if (typeof tier === "string") {
    const trimmed = tier.trim();
    if (trimmed.startsWith("$")) return trimmed;
    const maybeNumber = Number(trimmed);
    if (Number.isFinite(maybeNumber)) return PRICE_MAP[maybeNumber] || null;
  }
  if (typeof tier === "number") return PRICE_MAP[tier] || null;
  return null;
}

export default function ChatWidget({ isLoggedIn, role }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm Foody, your personal restaurant assistant. Ask me anything!",
      recommendations: []
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage) return;

    if (!isLoggedIn) {
      setMessages(prev => [...prev,
        { role: "user", content: userMessage, recommendations: [] },
        { role: "assistant", content: "Please log in to get personalized restaurant recommendations! 🔐", recommendations: [] }
      ]);
      setInput("");
      return;
    }

    if (role !== "user") {
      setMessages(prev => [...prev,
        { role: "user", content: userMessage, recommendations: [] },
        { role: "assistant", content: "AI recommendations are available for reviewer accounts only. Please log in as a user. 🔐", recommendations: [] }
      ]);
      setInput("");
      return;
    }

    const newMessages = [...messages, { role: "user", content: userMessage, recommendations: [] }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages.slice(1, -1).map(m => ({ role: m.role, content: m.content }));
      const res = await api.post("/ai-assistant/chat", {
        message: userMessage,
        conversation_history: history
      });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.data.response,
        recommendations: res.data.recommendations || []
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again!",
        recommendations: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "56px", height: "56px", borderRadius: "50%",
          background: "#d32323", color: "#fff", border: "none",
          cursor: "pointer", fontSize: "24px", zIndex: 1000,
          boxShadow: "0 4px 12px rgba(211,35,35,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: expanded ? "20px" : "90px",
          right: expanded ? "20px" : "24px",
          width: expanded ? "600px" : "360px",
          height: expanded ? "700px" : "520px",
          background: "#fff",
          borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column", zIndex: 999,
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          overflow: "hidden", border: "1px solid #e0e0e0",
          transition: "width 0.25s ease, height 0.25s ease, bottom 0.25s ease, right 0.25s ease"
        }}>
          {/* Header */}
          <div style={{ background: "#d32323", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>🍽️ Foody</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px" }}>Your AI Restaurant Assistant</div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => setExpanded(prev => !prev)}
                title={expanded ? "Shrink" : "Expand"}
                style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", cursor: "pointer", fontSize: "15px", padding: "4px 8px", borderRadius: "4px", lineHeight: 1 }}
              >
                {expanded ? "↘" : "↗"}
              </button>
              <button onClick={() => setMessages([{ role: "assistant", content: "👋 Hi! I'm Foody, your personal restaurant assistant. Ask me anything!", recommendations: [] }])}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "14px" }}>
                🗑️
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px", background: "#fafafa" }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "8px" }}>
                  {msg.role === "assistant" && (
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#d32323", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🍽️</div>
                  )}
                  <div style={{
                    maxWidth: "80%", padding: "10px 12px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user" ? "#d32323" : "#fff",
                    color: msg.role === "user" ? "#fff" : "#333",
                    fontSize: "13px", lineHeight: "1.5",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    border: msg.role === "assistant" ? "1px solid #e8e8e8" : "none",
                    whiteSpace: "pre-wrap"
                  }}>
                    {msg.content}
                  </div>
                </div>

                {/* Restaurant cards */}
                {msg.recommendations?.length > 0 && (
                  <div style={{ marginTop: "8px", marginLeft: "36px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {msg.recommendations.map(r => (
                      <Link key={r.id} to={`/restaurant/${r.id}`} onClick={() => setOpen(false)} style={{ textDecoration: "none" }}>
                        <div style={{
                          display: "flex", gap: "8px", background: "#fff",
                          border: "1px solid #e0e0e0", borderRadius: "8px",
                          padding: "8px", cursor: "pointer"
                        }}>
                          <img
                            src={CUISINE_IMAGES[r.cuisine] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80"}
                            alt={r.name}
                            style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "13px", color: "#0073bb" }}>{r.name}</div>
                            <div style={{ fontSize: "11px", color: "#666" }}>{r.cuisine} • {formatPricingTier(r.pricing_tier) || "$$"}</div>
                            <div style={{ fontSize: "11px", color: "#f15700" }}>{"★".repeat(Math.round(r.average_rating || 0))}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#d32323", display: "flex", alignItems: "center", justifyContent: "center" }}>🍽️</div>
                <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "16px", padding: "10px 14px", display: "flex", gap: "4px" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ccc", animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          <div style={{ padding: "6px 10px", background: "#fff", borderTop: "1px solid #f0f0f0", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {QUICK_ACTIONS.map(action => (
              <button key={action} onClick={() => sendMessage(action)} style={{
                padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
                border: "1px solid #e0e0e0", background: "#f9f9f9",
                color: "#333", cursor: "pointer"
              }}>{action}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: "flex", padding: "10px", background: "#fff", borderTop: "1px solid #e0e0e0", gap: "8px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
              placeholder={isLoggedIn ? "Ask Foody anything..." : "Login to get recommendations"}
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #e0e0e0", borderRadius: "20px", fontSize: "13px", outline: "none" }}
              disabled={loading}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
              background: loading || !input.trim() ? "#ccc" : "#d32323",
              color: "#fff", border: "none", borderRadius: "50%",
              width: "36px", height: "36px", cursor: "pointer", fontSize: "16px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>➤</button>
          </div>
        </div>
      )}

      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }`}</style>
    </>
  );
}