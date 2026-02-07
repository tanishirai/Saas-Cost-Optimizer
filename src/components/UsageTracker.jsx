import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Activity,
  GitBranch,
  Music,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

function UsageTracker({ subscription, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");

  const trackUsage = async () => {
    // For GitHub, show input first
    if (subscription.service_name === "GitHub" && !githubUsername) {
      setShowInput(true);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("Not authenticated");

      let requestBody = { service: subscription.service_name };

      if (subscription.service_name === "GitHub") {
        requestBody.githubUsername = githubUsername;
      }

      console.log("Tracking usage for:", requestBody);

      const response = await fetch(
        "https://dagsaohdehysplnqyaou.supabase.co/functions/v1/track-usage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      const data = await response.json();
      console.log("Response:", data);
      console.log("Usage Data:", data.usageData); // Add this line
      console.log("Score:", data.usageScore); // Add this line

      if (data.success) {
        setResult({
          type: "success",
          score: data.usageScore,
          details: data.usageData,
        });
        setShowInput(false);
        setTimeout(() => onUpdate(), 1000);
      } else {
        setResult({
          type: "error",
          message: data.error || "Failed to track usage",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setResult({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "var(--color-accent)";
    if (score >= 40) return "#FFA500";
    return "var(--color-danger)";
  };

  const getIcon = () => {
    if (subscription.service_name === "GitHub") return <GitBranch size={16} />;
    if (subscription.service_name === "Spotify") return <Music size={16} />;
    return <Activity size={16} />;
  };

  return (
    <div>
      {/* GitHub Username Input */}
      {showInput && subscription.service_name === "GitHub" && (
        <div style={{ marginBottom: "12px" }}>
          <input
            type="text"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            placeholder="Enter GitHub username"
            className="input"
            style={{
              fontSize: "13px",
              padding: "10px 12px",
              marginBottom: "8px",
            }}
          />
          <button
            onClick={trackUsage}
            disabled={!githubUsername.trim() || loading}
            className="btn btn-primary"
            style={{ fontSize: "12px", padding: "8px 14px", width: "100%" }}
          >
            {loading ? "Tracking..." : "Track GitHub Usage"}
          </button>
        </div>
      )}

      {/* Track Button */}
      {!showInput && (
        <button
          onClick={trackUsage}
          disabled={loading}
          className="btn btn-secondary"
          style={{ fontSize: "12px", padding: "8px 14px", width: "100%" }}
        >
          {getIcon()}
          {loading ? "Tracking..." : "Track Usage"}
        </button>
      )}

      {/* Results */}
      {result && (
        <div style={{ marginTop: "12px" }}>
          {result.type === "success" ? (
            <div
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(24, 58, 55, 0.2)",
                border: "1px solid var(--color-accent)",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: getScoreColor(result.score),
                  marginBottom: "8px",
                }}
              >
                {result.score}/100
              </div>
              {result.details.commits !== undefined && (
                <div
                  style={{ fontSize: "12px", color: "var(--color-text-muted)" }}
                >
                  {result.details.commits} commits •{" "}
                  {result.details.pullRequests} PRs •{" "}
                  {result.details.activeRepos} active repos
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(196, 73, 0, 0.15)",
                border: "1px solid var(--color-danger)",
                color: "var(--color-danger)",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={16} />
              {result.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UsageTracker;
