import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Analytics({ subscriptions }) {
  // Calculate category data
  const categoryData = subscriptions.reduce((acc, sub) => {
    const existing = acc.find((item) => item.name === sub.category);
    const cost = parseFloat(sub.monthly_cost) || 0;
    const monthlyCost = sub.billing_cycle === "yearly" ? cost / 12 : cost;

    if (existing) {
      existing.value += monthlyCost;
    } else {
      acc.push({ name: sub.category, value: monthlyCost });
    }
    return acc;
  }, []);

  categoryData.sort((a, b) => b.value - a.value);

  const calculateMonthlyTrend = (subscriptions) => {
    const now = new Date();
    const months = [];

    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        amount: 0,
      });
    }

    subscriptions.forEach((sub) => {
      const cost = parseFloat(sub.monthly_cost) || 0;
      const createdAt = sub.created_at ? new Date(sub.created_at) : new Date(0);

      months.forEach((monthData, index) => {
        const monthDate = new Date(
          now.getFullYear(),
          now.getMonth() - (2 - index),
          1
        );

        if (createdAt <= monthDate) {
          monthData.amount += cost;
        }
      });
    });

    return months;
  };

  const monthlyTrend = calculateMonthlyTrend(subscriptions);

  const CATEGORY_COLORS = {
    Streaming: "#e74c3c",
    Development: "#3498db",
    Design: "#9b59b6",
    Productivity: "#2ecc71",
    AI: "#f39c12",
    "Cloud Storage": "#1abc9c",
    Gaming: "#e67e22",
    Music: "#e91e63",
    Education: "#00bcd4",
    Other: "#95a5a6",
  };

  const COLORS = categoryData.map(
    (entry) => CATEGORY_COLORS[entry.name] || CATEGORY_COLORS["Other"]
  );

  const total = categoryData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = data.name
        ? ((data.value / total) * 100).toFixed(1)
        : data.value;

      return (
        <div
          style={{
            background: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(239, 214, 172, 0.3)",
            padding: "12px 16px",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <p
            style={{
              fontWeight: 600,
              fontSize: "13px",
              margin: "0 0 6px 0",
              color: "#efd6ac",
            }}
          >
            {data.name}
          </p>
          <p
            style={{
              fontWeight: 700,
              fontSize: "18px",
              color: data.fill || "#c4490a",
              margin: "0 0 4px 0",
            }}
          >
            ₹{data.value.toFixed(0)}
          </p>
          {data.name && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              {percent}% of total
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (subscriptions.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: "center",
          padding: "40px 20px",
          marginBottom: "28px",
        }}
      >
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
          Add subscriptions to see analytics
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-2"
      style={{
        marginBottom: "28px",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {/* Spending by Category */}
      <div className="card">
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: "24px",
          }}
        >
          Spending by Category
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          {/* Donut Chart - ✅ FIXED WITH ASPECT */}
          <div style={{ width: "200px", flexShrink: 0 }}>
            <ResponsiveContainer width="100%" aspect={1}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  strokeWidth={3}
                  stroke="var(--color-background)"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ flex: "1", minWidth: "200px" }}>
            {categoryData.map((entry, index) => {
              const percent = ((entry.value / total) * 100).toFixed(1);
              return (
                <div
                  key={`${entry.name}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                    padding: "6px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "3px",
                        background: COLORS[index],
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--color-text)",
                      }}
                    >
                      {entry.name}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                      marginLeft: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: COLORS[index],
                      }}
                    >
                      ₹{entry.value.toFixed(0)}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Spending Trend - ✅ FIXED WITH ASPECT */}
      <div className="card">
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: "24px",
          }}
        >
          Monthly Spending Trend
        </h3>
        <div style={{ width: "100%" }}>
          <ResponsiveContainer width="100%" aspect={2}>
            <BarChart data={monthlyTrend}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4490a" stopOpacity={1} />
                  <stop offset="100%" stopColor="#783d20" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(239, 214, 172, 0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="var(--color-text-muted)"
                style={{ fontSize: "13px", fontWeight: 600 }}
                tick={{ fill: "var(--color-text-muted)" }}
              />
              <YAxis
                stroke="var(--color-text-muted)"
                style={{ fontSize: "12px", fontWeight: 600 }}
                tick={{ fill: "var(--color-text-muted)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="amount"
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={70}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
