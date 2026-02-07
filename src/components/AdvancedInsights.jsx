import { TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react'

function AdvancedInsights({ subscriptions }) {
  // Calculate metrics
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const cost = parseFloat(sub.monthly_cost) || 0
    return sum + (sub.billing_cycle === 'yearly' ? cost / 12 : cost)
  }, 0)

  const yearlySubscriptions = subscriptions.filter(s => s.billing_cycle === 'yearly')
  const monthlySubscriptions = subscriptions.filter(s => s.billing_cycle === 'monthly')

  const avgSubscriptionCost = subscriptions.length > 0 
    ? totalMonthly / subscriptions.length 
    : 0

  const upcomingRenewals = subscriptions.filter(sub => {
    if (!sub.next_billing_date) return false
    const daysUntil = Math.ceil((new Date(sub.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24))
    return daysUntil >= 0 && daysUntil <= 7
  })

  const mostExpensive = subscriptions.reduce((max, sub) => 
    parseFloat(sub.monthly_cost) > parseFloat(max.monthly_cost || 0) ? sub : max
  , {})

  const categorySpending = subscriptions.reduce((acc, sub) => {
    const category = sub.category || 'Other'
    const cost = parseFloat(sub.monthly_cost) || 0
    const monthlyCost = sub.billing_cycle === 'yearly' ? cost / 12 : cost
    acc[category] = (acc[category] || 0) + monthlyCost
    return acc
  }, {})

  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]

  return (
    <div style={{
      background: 'var(--card-background)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '28px',
      border: '1px solid var(--color-border)',
      marginBottom: '28px'
    }}>
      <h3 style={{
        color: 'var(--color-text)',
        fontSize: '20px',
        fontWeight: 700,
        marginBottom: '20px'
      }}>
        📊 Advanced Insights
      </h3>

      <div className="grid grid-2" style={{ gap: '16px' }}>
        {/* Upcoming Renewals */}
        <div style={{
          background: upcomingRenewals.length > 0 
            ? 'rgba(239, 214, 172, 0.1)' 
            : 'rgba(239, 214, 172, 0.05)',
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${upcomingRenewals.length > 0 ? 'var(--color-accent)' : 'var(--color-border)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              background: 'rgba(239, 214, 172, 0.2)',
              padding: '10px',
              borderRadius: '10px'
            }}>
              <AlertTriangle size={20} color="var(--color-accent)" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Upcoming (Next 7 Days)
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)' }}>
                {upcomingRenewals.length}
              </div>
            </div>
          </div>
          {upcomingRenewals.length > 0 && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {upcomingRenewals.map(s => s.service_name).join(', ')}
            </div>
          )}
        </div>

        {/* Average Cost */}
        <div style={{
          background: 'rgba(239, 214, 172, 0.05)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(239, 214, 172, 0.2)',
              padding: '10px',
              borderRadius: '10px'
            }}>
              <Target size={20} color="var(--color-accent)" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Avg per Subscription
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)' }}>
                ₹{avgSubscriptionCost.toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Cycle Split */}
        <div style={{
          background: 'rgba(239, 214, 172, 0.05)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
            Billing Cycle Split
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-accent)' }}>
                {monthlySubscriptions.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Monthly
              </div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-danger)' }}>
                {yearlySubscriptions.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Yearly
              </div>
            </div>
          </div>
        </div>

        {/* Top Spending Category */}
        <div style={{
          background: 'rgba(239, 214, 172, 0.05)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
            Top Spending Category
          </div>
          {topCategory && (
            <>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-accent)' }}>
                {topCategory[0]}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                ₹{topCategory[1].toFixed(0)}/month
              </div>
            </>
          )}
        </div>
      </div>

      {/* Most Expensive Subscription */}
      {mostExpensive.service_name && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'rgba(196, 73, 0, 0.1)',
          borderRadius: '12px',
          border: '1px solid var(--color-danger)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '4px' }}>
              💰 Most Expensive
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
              {mostExpensive.service_name}
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-danger)' }}>
            ₹{parseFloat(mostExpensive.monthly_cost).toFixed(0)}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedInsights
