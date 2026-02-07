import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Plus,
  LogOut,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  Crown,
  Download,
} from "lucide-react";
import AddSubscription from "./AddSubscription";
import SubscriptionList from "./SubscriptionList";
import Analytics from "./Analytics";
import InsightsPanel from "./InsightsPanel";
import FilterBar from "./FilterBar";
import PremiumUpgrade from "../components/PremiumUpgrade";
import {
  exportToCSV,
  formatSubscriptionsForExport,
  exportToPDF,
} from "../utils/exportUtils";
import EmailParser from "./EmailParser";
import RenewalReminders from "./RenewalReminders";
import Tabs from "./Tabs";
import RenewalCalendar from "./RenewalCalendar";
import AdvancedInsights from "./AdvancedInsights";
import ReportsSection from "./ReportsSection";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    getUser();
    fetchProfile();
    fetchSubscriptions();
  }, []);

  // Handle Stripe redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const canceled = urlParams.get("canceled");

    if (success) {
      setTimeout(async () => {
        await fetchProfile();
        await fetchSubscriptions();
        alert("🎉 Payment successful! Your premium features are now active.");
      }, 2000);
      window.history.replaceState({}, "", "/dashboard");
    }

    if (canceled) {
      alert("Payment was canceled. You can upgrade anytime!");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, email, subscription_tier")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Profile fetch error:", error);
          setProfile({
            name: user.email?.split("@")[0],
            email: user.email,
            subscription_tier: "free",
          });
          return;
        }

        if (data) {
          setProfile(data);
        }
      }
    } catch (err) {
      console.error("Profile error:", err);
      setProfile({ subscription_tier: "free" });
    }
  }

  async function fetchSubscriptions() {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
      setFilteredSubscriptions(data || []);
    } catch (error) {
      alert("Error loading subscriptions: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // CSV Subscriptions Export
  const handleExportSubscriptions = () => {
    if (subscriptions.length === 0) {
      alert("📊 No subscriptions to export");
      return;
    }

    const formattedData = formatSubscriptionsForExport(subscriptions);
    const filename = `subscriptions_${new Date().toISOString().split("T")[0]}.csv`;
    exportToCSV(formattedData, filename);
  };

  // PDF Export
  const handleExportPDF = () => {
    if (subscriptions.length === 0) {
      alert("📊 No subscriptions to export");
      return;
    }

    if (profile?.subscription_tier !== "premium") {
      alert("🔒 PDF export is a premium feature. Upgrade to access!");
      return;
    }

    try {
      exportToPDF(subscriptions, profile);
      console.log("✅ PDF exported successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      alert("❌ Failed to generate PDF: " + error.message);
    }
  };

  // Calculate stats
  const totalMonthly = filteredSubscriptions.reduce((sum, sub) => {
    const cost = parseFloat(sub.monthly_cost) || 0;
    return sum + (sub.billing_cycle === "yearly" ? cost / 12 : cost);
  }, 0);

  const totalYearly = totalMonthly * 12;

  const unusedSubs = filteredSubscriptions.filter((sub) => {
    if (!sub.last_used) return false;
    const daysSince = Math.floor(
      (new Date() - new Date(sub.last_used)) / (1000 * 60 * 60 * 24),
    );
    return daysSince > 30;
  }).length;

  const potentialSavings = filteredSubscriptions
    .filter((sub) => {
      if (!sub.last_used) return false;
      const daysSince = Math.floor(
        (new Date() - new Date(sub.last_used)) / (1000 * 60 * 60 * 24),
      );
      return daysSince > 30;
    })
    .reduce((sum, sub) => sum + parseFloat(sub.monthly_cost), 0);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "16px",
        }}
      >
        <div className="spinner"></div>
        <p
          style={{ color: "var(--color-text)", fontSize: 16, fontWeight: 600 }}
        >
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          background: "var(--card-background)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "28px",
          marginBottom: "28px",
          border: "2px solid var(--color-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                color: "var(--color-text)",
                fontSize: "32px",
                fontWeight: "800",
                letterSpacing: "-0.5px",
                marginBottom: "8px",
              }}
            >
              Hello, {profile?.name || user?.email?.split("@")[0] || "there"}!
              👋
            </h1>
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {profile?.subscription_tier === "free" && (
              <button
                onClick={() => setShowPremium(true)}
                className="btn btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background:
                    "linear-gradient(135deg, var(--color-muted) 0%, var(--color-danger) 100%)",
                  border: "none",
                }}
              >
                <Crown size={20} />
                Upgrade to Premium
              </button>
            )}

            {profile?.subscription_tier === "premium" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  background:
                    "linear-gradient(135deg, #FF7700 0%, #FFC800 100%)",
                  borderRadius: "12px",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                <Crown size={20} />
                Premium Member
              </div>
            )}

            <button onClick={handleLogout} className="btn btn-danger">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-3" style={{ marginBottom: "28px" }}>
            <div className="stat-card">
              <div
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                <div
                  style={{
                    background: "rgba(239, 214, 172, 0.15)",
                    padding: "14px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DollarSign size={28} strokeWidth={2} />
                </div>
                <div>
                  <div className="stat-label">Monthly Cost</div>
                  <div className="stat-value">₹{totalMonthly.toFixed(0)}</div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                <div
                  style={{
                    background: "rgba(239, 214, 172, 0.15)",
                    padding: "14px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp size={28} strokeWidth={2} />
                </div>
                <div>
                  <div className="stat-label">Annual Projection</div>
                  <div className="stat-value">₹{totalYearly.toFixed(0)}</div>
                </div>
              </div>
            </div>

            <div
              className="stat-card"
              style={{
                background:
                  unusedSubs > 0
                    ? "linear-gradient(135deg, rgba(196, 73, 0, 0.2) 0%, rgba(139, 51, 0, 0.2) 100%)"
                    : "linear-gradient(135deg, rgba(239, 214, 172, 0.12) 0%, rgba(196, 73, 0, 0.12) 100%)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                <div
                  style={{
                    background: "rgba(239, 214, 172, 0.15)",
                    padding: "14px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {unusedSubs > 0 ? (
                    <AlertCircle size={28} strokeWidth={2} />
                  ) : (
                    <Activity size={28} strokeWidth={2} />
                  )}
                </div>
                <div>
                  <div className="stat-label">
                    {unusedSubs > 0 ? "Potential Savings" : "Status"}
                  </div>
                  <div className="stat-value">
                    {unusedSubs > 0
                      ? `₹${potentialSavings.toFixed(0)}`
                      : "Active"}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <AdvancedInsights subscriptions={subscriptions} />
          {/* Insights Panel */}
          <InsightsPanel subscriptions={subscriptions} />

          {/* Analytics Section */}
          <Analytics subscriptions={filteredSubscriptions} />
          <RenewalCalendar subscriptions={subscriptions} />
        </>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <>
          {/* Add Button */}
          <div style={{ marginBottom: "28px" }}>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-success"
              style={{
                width: "100%",
                justifyContent: "center",
                fontSize: "15px",
                padding: "16px",
                fontWeight: 700,
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
              Add New Subscription
            </button>
          </div>

          {/* Subscriptions List with Filters */}
          <div
            style={{
              background: "var(--card-background)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              padding: "28px",
              border: "1px solid var(--color-border)",
            }}
          >
            <h2
              style={{
                color: "var(--color-text)",
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              Your Subscriptions
              <span
                style={{
                  background: "var(--card-background)",
                  padding: "3px 10px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "1px solid var(--color-border)",
                }}
              >
                {filteredSubscriptions.length}
              </span>
            </h2>

            <FilterBar
              subscriptions={subscriptions}
              onFilterChange={setFilteredSubscriptions}
            />

            <SubscriptionList
              subscriptions={filteredSubscriptions}
              onUpdate={fetchSubscriptions}
            />
          </div>
        </>
      )}

      {/* Automations Tab */}
      {activeTab === "automations" && (
        <>
          <EmailParser onSuccess={fetchSubscriptions} />
          <RenewalReminders />
        </>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <>
           <ReportsSection subscriptions={subscriptions} profile={profile} />
          {/* Export Section */}
          <div
            style={{
              background: "var(--card-background)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              padding: "28px",
              marginBottom: "28px",
              border: "1px solid var(--color-border)",
            }}
          >
            <h3
              style={{
                color: "var(--color-text)",
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Download size={24} />
              Export Reports
            </h3>
            <p
              style={{
                color: "var(--color-text-muted)",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              Download your subscription data in various formats
            </p>

            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <button
                onClick={handleExportSubscriptions}
                className="btn btn-secondary"
                disabled={subscriptions.length === 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                📥 Export Subscriptions (CSV)
              </button>

              <button
                onClick={handleExportPDF}
                className="btn btn-primary"
                disabled={subscriptions.length === 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: profile?.subscription_tier !== "premium" ? 0.6 : 1,
                  position: "relative",
                }}
              >
                📄 Generate PDF Report
                {profile?.subscription_tier !== "premium" && (
                  <span
                    style={{
                      marginLeft: "4px",
                      fontSize: "11px",
                      backgroundColor: "#ff6b35",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontWeight: 700,
                    }}
                  >
                    Premium
                  </span>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddSubscription
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchSubscriptions();
          }}
        />
      )}

      {showPremium && (
        <PremiumUpgrade
          currentTier={profile?.subscription_tier || "free"}
          onClose={() => setShowPremium(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
