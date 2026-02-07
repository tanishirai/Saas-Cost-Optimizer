import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Format subscription data for CSV export
export function formatSubscriptionsForExport(subscriptions) {
  return subscriptions.map((sub) => ({
    "Service Name": sub.service_name,
    Category: sub.category,
    "Monthly Cost": sub.monthly_cost,
    "Billing Cycle": sub.billing_cycle,
    "Renewal Date": sub.next_billing_date
      ? new Date(sub.next_billing_date).toLocaleDateString()
      : "N/A",
    Status: sub.status,
    "Auto Renew": sub.auto_renew ? "Yes" : "No",
    "Payment Method": sub.payment_method || "N/A",
    "Last Used": sub.last_used
      ? new Date(sub.last_used).toLocaleDateString()
      : "N/A",
  }));
}

// Format usage data for CSV export
export function formatUsageForExport(usage) {
  return usage.map((u) => ({
    Service: u.service_name || "Unknown",
    Date: new Date(u.usage_date).toLocaleDateString(),
    "Usage Amount": u.usage_amount,
    Unit: u.usage_unit,
    "Cost Impact": u.cost_impact || "N/A",
  }));
}

// Export data to CSV
export function exportToCSV(data, filename = "export.csv") {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(","), // Header row
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle values with commas or quotes
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? "";
        })
        .join(","),
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate PDF Report
export function exportToPDF(subscriptions, profile) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("Subscription Cost Report", 14, 22);

  // Date & User
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 30);
  doc.text(`User: ${profile?.name || profile?.email || "User"}`, 14, 35);

  // Calculate totals
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const cost = parseFloat(sub.monthly_cost) || 0;
    return sum + (sub.billing_cycle === "yearly" ? cost / 12 : cost);
  }, 0);

  const totalYearly = totalMonthly * 12;
  const activeSubs = subscriptions.filter((s) => {
    const status = s.status?.toLowerCase();
    return !status || status === "active";
  }).length;
  // Summary Box
  doc.setFillColor(240, 242, 245);
  doc.roundedRect(14, 42, 182, 32, 2, 2, "F");

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("Summary", 18, 50);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Subscriptions: ${subscriptions.length}`, 18, 58);
  doc.text(`Active: ${activeSubs}`, 18, 64);

  doc.text(`Monthly Cost: Rs ${totalMonthly.toFixed(2)}`, 110, 58);
  doc.text(`Annual Cost: Rs ${totalYearly.toFixed(2)}`, 110, 64);

  // Category breakdown
  const categoryData = subscriptions.reduce((acc, sub) => {
    const cost = parseFloat(sub.monthly_cost) || 0;
    const monthlyCost = sub.billing_cycle === "yearly" ? cost / 12 : cost;
    acc[sub.category] = (acc[sub.category] || 0) + monthlyCost;
    return acc;
  }, {});

  // Category table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("Category Breakdown", 14, 85);

  const categoryTableData = Object.entries(categoryData).map(([cat, cost]) => [
    cat,
    `Rs ${cost.toFixed(2)}`,
    `${((cost / totalMonthly) * 100).toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: 90,
    head: [["Category", "Monthly Cost", "% of Total"]],
    body: categoryTableData,
    theme: "grid",
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
      halign: "left",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [40, 40, 40],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { left: 14, right: 14 },
    styles: {
      cellPadding: 4,
      lineColor: [220, 220, 220],
      lineWidth: 0.5,
    },
  });

  // Get the Y position after the first table
  const finalY = doc.lastAutoTable.finalY;

  // Subscriptions table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("All Subscriptions", 14, finalY + 12);

  const subscriptionTableData = subscriptions.map((sub) => [
    sub.service_name,
    sub.category,
    `Rs ${parseFloat(sub.monthly_cost).toFixed(2)}`,
    sub.billing_cycle,
    sub.status || "active",
    sub.next_billing_date
      ? new Date(sub.next_billing_date).toLocaleDateString("en-IN")
      : "N/A",
  ]);

  autoTable(doc, {
    startY: finalY + 17,
    head: [["Service", "Category", "Cost", "Cycle", "Status", "Next Billing"]],
    body: subscriptionTableData,
    theme: "grid",
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [40, 40, 40],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
    },
    margin: { left: 14, right: 14 },
    styles: {
      cellPadding: 3,
      lineColor: [220, 220, 220],
      lineWidth: 0.5,
    },
  });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);

    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );

    doc.text(
      "Generated by SaaS Cost Optimizer",
      14,
      doc.internal.pageSize.height - 10,
    );
  }

  // Save with proper filename
  const filename = `subscription_report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

// Text report export (legacy)
export function exportSummaryReport(subscriptions) {
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const cost = parseFloat(sub.monthly_cost) || 0;
    return sum + (sub.billing_cycle === "yearly" ? cost / 12 : cost);
  }, 0);

  const totalYearly = totalMonthly * 12;

  const unusedSubs = subscriptions.filter((sub) => {
    if (!sub.last_used) return false;
    const daysSince = Math.floor(
      (new Date() - new Date(sub.last_used)) / (1000 * 60 * 60 * 24),
    );
    return daysSince > 30;
  });

  const potentialSavings = unusedSubs.reduce(
    (sum, sub) => sum + parseFloat(sub.monthly_cost),
    0,
  );

  const categoryBreakdown = subscriptions.reduce((acc, sub) => {
    const cost = parseFloat(sub.monthly_cost) || 0;
    const monthlyCost = sub.billing_cycle === "yearly" ? cost / 12 : cost;
    acc[sub.category] = (acc[sub.category] || 0) + monthlyCost;
    return acc;
  }, {});

  const report = `
SUBSCRIPTION COST REPORT
Generated: ${new Date().toLocaleDateString("en-IN")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY
━━━━━━━
Total Subscriptions: ${subscriptions.length}
Monthly Cost: ₹${totalMonthly.toFixed(2)}
Annual Cost: ₹${totalYearly.toFixed(2)}
Unused Subscriptions: ${unusedSubs.length}
Potential Monthly Savings: ₹${potentialSavings.toFixed(2)}

CATEGORY BREAKDOWN
━━━━━━━━━━━━━━━━━━
${Object.entries(categoryBreakdown)
  .map(([cat, cost]) => `${cat.padEnd(20)} ₹${cost.toFixed(2)}`)
  .join("\n")}

SUBSCRIPTIONS
━━━━━━━━━━━━━
${subscriptions
  .map(
    (sub) => `
${sub.service_name}
  Category: ${sub.category}
  Cost: ₹${sub.monthly_cost} (${sub.billing_cycle})
  Last Used: ${sub.last_used || "N/A"}
  Next Billing: ${sub.next_billing_date || "N/A"}
`,
  )
  .join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report generated by SaaS Cost Optimizer
`;

  const blob = new Blob([report], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `subscription_report_${new Date().toISOString().split("T")[0]}.txt`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
