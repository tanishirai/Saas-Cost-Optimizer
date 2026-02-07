import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Mail, Loader, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

function EmailParser({ onSuccess }) {
  const [emailText, setEmailText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [results, setResults] = useState(null);

  // Email patterns for common subscription services
  const subscriptionPatterns = {
    netflix: {
      pattern: /netflix/i,
      pricePattern: /(?:₹|Rs\.?\s*|INR\s*)(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      category: "Streaming",
      displayName: "Netflix",
    },
    spotify: {
      pattern: /spotify/i,
      pricePattern: /(?:₹|Rs\.?\s*|INR\s*)(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      category: "Streaming",
      displayName: "Spotify",
    },
    "amazon-prime": {
      pattern: /amazon\s*prime/i,
      pricePattern: /(?:₹|Rs\.?\s*|INR\s*)(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      category: "Streaming",
      displayName: "Amazon Prime",
    },
    github: {
      pattern: /github/i,
      pricePattern: /\$\s*(\d+(?:\.\d{2})?)/,
      category: "Development",
      displayName: "GitHub",
    },
    notion: {
      pattern: /notion/i,
      pricePattern: /\$\s*(\d+(?:\.\d{2})?)/,
      category: "Productivity",
      displayName: "Notion",
    },
    openai: {
      pattern: /openai|chatgpt/i,
      pricePattern: /\$\s*(\d+(?:\.\d{2})?)/,
      category: "AI",
      displayName: "OpenAI",
    },
    claude: {
      pattern: /anthropic|claude/i,
      pricePattern: /\$\s*(\d+(?:\.\d{2})?)/,
      category: "AI",
      displayName: "Claude",
    },
    vercel: {
      pattern: /vercel/i,
      pricePattern: /\$\s*(\d+(?:\.\d{2})?)/,
      category: "Development",
      displayName: "Vercel",
    },
    canva: {
      pattern: /canva/i,
      pricePattern: /(?:₹|Rs\.?\s*|INR\s*|\$\s*)(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      category: "Design",
      displayName: "Canva",
    },
    figma: {
      pattern: /figma/i,
      pricePattern: /\$\s*(\d+(?:\.\d{2})?)/,
      category: "Design",
      displayName: "Figma",
    },
    adobe: {
      pattern: /adobe/i,
      pricePattern: /(?:₹|Rs\.?\s*|INR\s*|\$\s*)(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      category: "Design",
      displayName: "Adobe",
    },
    dropbox: {
      pattern: /dropbox/i,
      pricePattern: /(?:₹|Rs\.?\s*|INR\s*|\$\s*)(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      category: "Cloud Storage",
      displayName: "Dropbox",
    },
    youtube: {
      pattern: /youtube\s*premium/i,
      pricePattern: /(?:₹|Rs\.?\s*|INR\s*)(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      category: "Streaming",
      displayName: "YouTube Premium",
    },
  };

  // Parse email content
 const parseEmailContent = (text) => {
  const found = []
  
  console.log('🔍 Parsing email:', text.substring(0, 100) + '...')
  
  for (const [service, config] of Object.entries(subscriptionPatterns)) {
    if (config.pattern.test(text)) {
      console.log(`✅ Found service: ${config.displayName}`)
      
      const priceMatch = text.match(config.pricePattern)
      console.log('💰 Price match:', priceMatch)
      
      let price = null
      if (priceMatch) {
        // Remove commas and parse
        price = parseFloat(priceMatch[1].replace(/,/g, ''))
        console.log('💵 Parsed price:', price)
      }
      
      // Detect billing cycle
      let billingCycle = 'monthly'
      if (/annual|yearly|year/i.test(text)) {
        billingCycle = 'yearly'
      }
      console.log('📅 Billing cycle:', billingCycle)
      
      // Detect dates (multiple formats)
      const datePatterns = [
        /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/,
        /(\d{4}-\d{2}-\d{2})/,
        /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i
      ]
      
      let nextBillingDate = null
      for (const pattern of datePatterns) {
        const match = text.match(pattern)
        if (match) {
          nextBillingDate = match[0]
          break
        }
      }
      console.log('📆 Next billing:', nextBillingDate)
      
      // Only add required fields for the database
      found.push({
        service_name: config.displayName,
        monthly_cost: price,
        category: config.category,
        billing_cycle: billingCycle,
        next_billing_date: nextBillingDate
      })
    }
  }
  
  console.log('📊 Total found:', found.length, found)
  return found
}


  // Handle parse button click
  const handleParseClick = async () => {
    if (!emailText || emailText.length < 50) {
      alert("⚠️ Please paste a complete email with subscription details");
      return;
    }

    setParsing(true);
    setResults(null);

    try {
      // Parse the email
      const detectedSubs = parseEmailContent(emailText);

      if (detectedSubs.length === 0) {
        setResults({
          success: false,
          message:
            "No subscriptions detected. Try another email or add manually.",
        });
        setParsing(false);
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Save detected subscriptions
      const saved = [];
      for (const sub of detectedSubs) {
        const { data, error } = await supabase
          .from("subscriptions")
          .insert([
            {
              user_id: user.id,
              ...sub,
            },
          ])
          .select();

        if (!error && data) {
          saved.push(data[0]);
        }
      }

      setResults({
        success: true,
        count: saved.length,
        subscriptions: saved,
      });

      // Clear form and refresh after 2 seconds
      setTimeout(() => {
        setEmailText("");
        setResults(null);
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error("Parse error:", error);
      setResults({
        success: false,
        message: "Error parsing email: " + error.message,
      });
    } finally {
      setParsing(false);
    }
  };

  return (
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
        <Mail size={24} />
        Auto-Detect from Email
      </h3>

      <p
        style={{
          color: "var(--color-text-muted)",
          marginBottom: "20px",
          fontSize: "14px",
        }}
      >
        Paste a subscription receipt email and we'll automatically detect and
        add it
      </p>

      <div style={{ marginBottom: "16px" }}>
        <textarea
          value={emailText}
          onChange={(e) => setEmailText(e.target.value)}
          placeholder="Paste your subscription receipt email here (e.g., from Netflix, Spotify, GitHub, etc.)..."
          disabled={parsing}
          style={{
            width: "100%",
            minHeight: "150px",
            padding: "16px",
            background: "rgba(26, 26, 26, 0.5)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-text)",
            fontSize: "14px",
            fontFamily: "monospace",
            resize: "vertical",
            opacity: parsing ? 0.5 : 1,
          }}
        />
      </div>

      <button
        onClick={handleParseClick}
        disabled={parsing || !emailText || emailText.length < 50}
        style={{
          width: "100%",
          padding: "14px",
          background:
            parsing || !emailText || emailText.length < 50
              ? "rgba(239, 214, 172, 0.3)"
              : "linear-gradient(135deg, var(--color-accent) 0%, var(--color-danger) 100%)",
          border: "none",
          borderRadius: "12px",
          color:
            parsing || !emailText || emailText.length < 50
              ? "var(--color-text-muted)"
              : "#0f0f0f",
          fontWeight: 700,
          fontSize: "15px",
          cursor:
            parsing || !emailText || emailText.length < 50
              ? "not-allowed"
              : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.3s",
        }}
      >
        {parsing ? (
          <>
            <Loader className="spinner" size={20} />
            Analyzing Email...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Parse & Add Subscription
          </>
        )}
      </button>

      {results && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            borderRadius: "12px",
            background: results.success
              ? "rgba(76, 175, 80, 0.1)"
              : "rgba(244, 67, 54, 0.1)",
            border: `1px solid ${results.success ? "var(--color-success)" : "var(--color-danger)"}`,
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          {results.success ? (
            <>
              <CheckCircle
                size={20}
                style={{ color: "var(--color-success)", marginTop: "2px" }}
              />
              <div>
                <strong
                  style={{ color: "var(--color-success)", fontSize: "15px" }}
                >
                  Success! Added {results.count} subscription
                  {results.count > 1 ? "s" : ""}
                </strong>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--color-text-muted)",
                    marginTop: "4px",
                  }}
                >
                  {results.subscriptions?.map((s) => s.service_name).join(", ")}
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertCircle
                size={20}
                style={{ color: "var(--color-danger)", marginTop: "2px" }}
              />
              <span style={{ color: "var(--color-text)", fontSize: "14px" }}>
                {results.message}
              </span>
            </>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          background: "rgba(239, 214, 172, 0.05)",
          borderRadius: "8px",
          fontSize: "13px",
          color: "var(--color-text-muted)",
        }}
      >
        💡 <strong>Tip:</strong> We can detect Netflix, Spotify, Amazon Prime,
        GitHub, OpenAI, Notion, YouTube Premium, and more!
      </div>
    </div>
  );
}

export default EmailParser;
