import { useState } from "react";
import { Trash2, Calendar, Clock, TrendingDown, Edit3 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import UsageTracker from "./UsageTracker";

function SubscriptionList({ subscriptions, onUpdate }) {
  const [editingDateFor, setEditingDateFor] = useState(null);
  const [newDate, setNewDate] = useState("");

  const handleDelete = async (id) => {
    if (!confirm("Delete this subscription?")) return;

    try {
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleMarkUsed = async (id) => {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ last_used: new Date().toISOString().split("T")[0] })
        .eq("id", id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDateEdit = (sub) => {
    setEditingDateFor(sub.id);
    setNewDate(sub.next_billing_date || "");
  };

  const handleDateUpdate = async (id) => {
    if (!newDate) {
      alert("⚠️ Please select a date");
      return;
    }

    try {
      // Update in database
      const { error } = await supabase
        .from("subscriptions")
        .update({ next_billing_date: newDate })
        .eq("id", id);

      if (error) throw error;

      // Update local state immediately (optimistic update)
      const updatedSubs = subscriptions.map((sub) =>
        sub.id === id ? { ...sub, next_billing_date: newDate } : sub,
      );

      // This assumes you pass setSubscriptions as a prop
      // If not available, just use onUpdate()

      // Close edit mode
      setEditingDateFor(null);
      setNewDate("");

      // Trigger refresh
      await onUpdate();

      alert("✅ Billing date updated!");
    } catch (error) {
      console.error("Error updating date:", error);
      alert("❌ Error: " + error.message);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Streaming: "var(--category-streaming)",
      Development: "var(--category-development)",
      Design: "var(--category-design)",
      Productivity: "var(--category-productivity)",
      AI: "var(--category-ai)",
      "Cloud Storage": "var(--category-cloud)",
      Other: "var(--category-other)",
    };
    return colors[category] || colors["Other"];
  };

  const getDaysUnused = (lastUsed) => {
    if (!lastUsed) return null;
    const days = Math.floor(
      (new Date() - new Date(lastUsed)) / (1000 * 60 * 60 * 24),
    );
    return days;
  };

  if (subscriptions.length === 0) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">📊</div>
        <h3 className="empty-state-title">No Subscriptions</h3>
        <p className="empty-state-text">
          Add your first subscription to start tracking expenses
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-2">
      {subscriptions.map((sub) => {
        const daysUnused = getDaysUnused(sub.last_used);
        const isUnused = daysUnused !== null && daysUnused > 30;
        const categoryColor = getCategoryColor(sub.category);

        return (
          <div
            key={sub.id}
            className="card"
            style={{
              borderLeft: `4px solid ${categoryColor}`,
              position: "relative",
            }}
          >
            {/* Top Right Actions */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                display: "flex",
                gap: "4px",
              }}
            >
              <button
                onClick={() => handleMarkUsed(sub.id)}
                className="icon-button"
                title="Mark as used today"
              >
                <Clock size={18} color="var(--color-accent)" strokeWidth={2} />
              </button>
              <button
                onClick={() => handleDelete(sub.id)}
                className="icon-button"
                title="Delete subscription"
              >
                <Trash2 size={18} color="var(--color-danger)" strokeWidth={2} />
              </button>
            </div>

            {/* Service Name & Category */}
            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--color-text)",
                  marginBottom: "10px",
                }}
              >
                {sub.service_name}
              </h3>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  className="category-badge"
                  style={{
                    background: `${categoryColor}25`,
                    color: categoryColor,
                    border: `1px solid ${categoryColor}50`,
                  }}
                >
                  {sub.category}
                </span>

                {/* Usage Score Badge */}
                {sub.usage_score &&
                  sub.usage_score > 0 &&
                  ["GitHub", "Spotify"].includes(sub.service_name) && (
                    <span
                      style={{
                        background:
                          sub.usage_score >= 70
                            ? "rgba(24, 58, 55, 0.25)"
                            : sub.usage_score >= 40
                              ? "rgba(255, 165, 0, 0.15)"
                              : "rgba(196, 73, 0, 0.1)",
                        color:
                          sub.usage_score >= 70
                            ? "var(--color-accent)"
                            : sub.usage_score >= 40
                              ? "#FFA500"
                              : "var(--color-danger)",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        border: `1.5px solid ${
                          sub.usage_score >= 70
                            ? "var(--color-accent)"
                            : sub.usage_score >= 40
                              ? "#FFA500"
                              : "var(--color-danger)"
                        }`,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span style={{ fontSize: "10px" }}>●</span>
                      Usage: {sub.usage_score}%
                    </span>
                  )}
              </div>
            </div>

            {/* Pricing */}
            <div
              style={{
                background: "rgba(239, 214, 172, 0.08)",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "baseline", gap: "6px" }}
              >
                <span
                  style={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    letterSpacing: "-0.5px",
                  }}
                >
                  ₹{parseFloat(sub.monthly_cost).toFixed(0)}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-muted)",
                    fontWeight: 600,
                  }}
                >
                  / {sub.billing_cycle}
                </span>
              </div>
              {sub.billing_cycle === "yearly" && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "var(--color-danger)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <TrendingDown size={12} />₹
                  {(parseFloat(sub.monthly_cost) / 12).toFixed(0)}/month
                  effective
                </div>
              )}
            </div>

            {/* Last Used & Next Billing */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              {sub.last_used && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                    background: isUnused
                      ? "rgba(196, 73, 0, 0.15)"
                      : "rgba(239, 214, 172, 0.08)",
                    borderRadius: "10px",
                    border: `1px solid ${isUnused ? "var(--color-danger)" : "var(--color-border)"}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: isUnused
                        ? "var(--color-danger)"
                        : "var(--color-text)",
                    }}
                  >
                    <Clock size={16} strokeWidth={2} />
                    <span>
                      {daysUnused === 0
                        ? "Active today"
                        : `${daysUnused} days inactive`}
                    </span>
                  </div>
                  {isUnused && (
                    <span
                      className="alert-badge"
                      style={{
                        background: "var(--color-danger)",
                        color: "var(--color-text)",
                      }}
                    >
                      UNUSED
                    </span>
                  )}
                </div>
              )}

              {/* Next Billing Date with Edit Functionality */}
              {sub.next_billing_date && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                    background: "rgba(239, 214, 172, 0.08)",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {editingDateFor === sub.id ? (
                    // Edit Mode
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                      }}
                    >
                      <Calendar
                        size={16}
                        strokeWidth={2}
                        color="var(--color-text-muted)"
                      />
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          background: "rgba(26, 26, 26, 0.5)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "6px",
                          color: "var(--color-text)",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      />
                      <button
                        onClick={() => handleDateUpdate(sub.id)}
                        style={{
                          padding: "6px 12px",
                          background: "var(--color-accent)",
                          color: "#0f0f0f",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditingDateFor(null);
                          setNewDate("");
                        }}
                        style={{
                          padding: "6px 12px",
                          background: "var(--color-danger)",
                          color: "var(--color-text)",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--color-text-muted)",
                        }}
                      >
                        <Calendar size={16} strokeWidth={2} />
                        <span>
                          Next:{" "}
                          {new Date(sub.next_billing_date).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDateEdit(sub)}
                        className="icon-button"
                        title="Edit billing date"
                        style={{
                          padding: "6px",
                          background: "rgba(239, 214, 172, 0.1)",
                          borderRadius: "6px",
                        }}
                      >
                        <Edit3
                          size={14}
                          color="var(--color-accent)"
                          strokeWidth={2}
                        />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Usage Tracker */}
            {["GitHub"].includes(sub.service_name) && (
              <div
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <UsageTracker subscription={sub} onUpdate={onUpdate} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SubscriptionList;
