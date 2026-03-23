import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";

const PRICE_MAP = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };

const QUICK_ACTIONS = [
  "Find dinner tonight 🍽️",
  "Best rated near me ⭐",
  "Vegan options 🌱",
  "Romantic dinner 🕯️",
  "Family friendly 👨‍👩‍👧",
  "Quick lunch 🥗",
];

const CUISINE_IMAGES = {
  Italian: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80",
  Chinese: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&q=80",
  Indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=80",
  Japanese: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&q=80",
  Mexican: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&q=80",
  American: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80",
};

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm your personal restaurant assistant. Tell me what you're craving or what occasion you're planning for, and I'll find the perfect spot for you!",
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

    const newMessages = [...messages, { role: "user", content: userMessage, recommendations: [] }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages
        .filter(m => m.role !== "assistant" || m !== newMessages[0])
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.post("/ai-assistant/chat", {
        message: userMessage,
        conversation_history: history.slice(0, -1)
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.data.response,
        recommendations: res.data.recommendations || []
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again!",
        recommendations: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "24px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
          🤖 AI Restaurant Assistant
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
          Powered by Claude AI • Ask me anything about restaurants
        </p>
      </div>

      {/* Chat window */}
      <div style={{
        border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}>

        {/* Messages area */}
        <div style={{
          height: "480px", overflowY: "auto", padding: "20px",
          background: "#fafafa", display: "flex", flexDirection: "column", gap: "16px"
        }}>
          {messages.map((msg, i) => (
            <div key={i}>
              {/* Message bubble */}
              <div style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                gap: "10px", alignItems: "flex-start"
              }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "#d32323", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "16px", flexShrink: 0
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: "75%", padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user" ? "#d32323" : "#fff",
                  color: msg.role === "user" ? "#fff" : "#333",
                  fontSize: "14px", lineHeight: "1.6",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: msg.role === "assistant" ? "1px solid #e8e8e8" : "none",
                  whiteSpace: "pre-wrap"
                }}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "#333", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "16px", flexShrink: 0
                  }}>👤</div>
                )}
              </div>

              {/* Restaurant recommendation cards */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div style={{ marginTop: "12px", marginLeft: "42px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {msg.recommendations.map(r => (
                    <Link key={r.id} to={`/restaurant/${r.id}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", gap: "12px", background: "#fff",
                        border: "1px solid #e0e0e0", borderRadius: "8px",
                        padding: "12px", cursor: "pointer", transition: "box-shadow 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
                      }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"}
                      >
                        <img
                          src={CUISINE_IMAGES[r.cuisine] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80"}
                          alt={r.name}
                          style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: "15px", color: "#0073bb", marginBottom: "3px" }}>{r.name}</div>
                          <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                            {r.cuisine} • {r.city} • {PRICE_MAP[r.pricing_tier] || "$$"}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ color: "#f15700", fontSize: "13px" }}>{"★".repeat(Math.round(r.average_rating || 0))}{"☆".repeat(5 - Math.round(r.average_rating || 0))}</span>
                            <span style={{ fontSize: "12px", color: "#666" }}>({r.review_count || 0} reviews)</span>
                          </div>
                          {r.description && (
                            <div style={{ fontSize: "12px", color: "#888", marginTop: "3px" }}>
                              {r.description.slice(0, 60)}...
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "#d32323", fontWeight: 600, alignSelf: "center" }}>View →</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Thinking indicator */}
          {loading && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "#d32323", display: "flex", alignItems: "center", justifyContent: "center"
              }}>🤖</div>
              <div style={{
                background: "#fff", border: "1px solid #e8e8e8", borderRadius: "18px",
                padding: "12px 16px", display: "flex", gap: "4px", alignItems: "center"
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: "8px", height: "8px", borderRadius: "50%", background: "#ccc",
                    animation: "bounce 1.2s infinite",
                    animationDelay: `${i * 0.2}s`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick action buttons */}
        <div style={{
          padding: "12px 16px", background: "#fff", borderTop: "1px solid #f0f0f0",
          display: "flex", gap: "8px", flexWrap: "wrap"
        }}>
          {QUICK_ACTIONS.map(action => (
            <button key={action} onClick={() => sendMessage(action)} style={{
              padding: "6px 12px", borderRadius: "20px", fontSize: "12px",
              border: "1px solid #e0e0e0", background: "#f9f9f9",
              color: "#333", cursor: "pointer", transition: "all 0.15s"
            }}
              onMouseEnter={e => { e.target.style.background = "#d32323"; e.target.style.color = "#fff"; e.target.style.borderColor = "#d32323"; }}
              onMouseLeave={e => { e.target.style.background = "#f9f9f9"; e.target.style.color = "#333"; e.target.style.borderColor = "#e0e0e0"; }}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div style={{
          display: "flex", padding: "12px 16px", background: "#fff",
          borderTop: "1px solid #e0e0e0", gap: "10px", alignItems: "center"
        }}>
          <button onClick={() => { setMessages([{ role: "assistant", content: "👋 Hi! I'm your personal restaurant assistant. Tell me what you're craving!", recommendations: [] }]); }}
            style={{
              background: "none", border: "1px solid #ccc", borderRadius: "6px",
              padding: "8px 12px", cursor: "pointer", fontSize: "13px", color: "#666"
            }}
            title="Clear chat"
          >
            🗑️
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... e.g. 'I want Italian food for a date night'"
            style={{
              flex: 1, padding: "10px 14px", border: "1px solid #e0e0e0",
              borderRadius: "24px", fontSize: "14px", outline: "none",
              fontFamily: "inherit"
            }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? "#ccc" : "#d32323",
              color: "#fff", border: "none", borderRadius: "50%",
              width: "40px", height: "40px", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            ➤
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}