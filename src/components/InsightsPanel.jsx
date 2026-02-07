import { TrendingDown, AlertTriangle, CheckCircle, Calendar } from 'lucide-react'

function InsightsPanel({ subscriptions }) {
  const insights = []

  const unusedSubs = subscriptions.filter(sub => {
    if (!sub.last_used) return false
    const daysSince = Math.floor((new Date() - new Date(sub.last_used)) / (1000 * 60 * 60 * 24))
    return daysSince > 30
  })

  const monthlySubs = subscriptions.filter(sub => sub.billing_cycle === 'monthly')

  if (unusedSubs.length > 0) {
    const savings = unusedSubs.reduce((sum, sub) => sum + parseFloat(sub.monthly_cost), 0)
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Unused Subscriptions',
      description: `You have ${unusedSubs.length} unused subscription${unusedSubs.length > 1 ? 's' : ''}`,
      action: `Save ₹${savings.toFixed(0)}/month by canceling`
    })
  }

  if (monthlySubs.length > 2) {
    insights.push({
      type: 'info',
      icon: TrendingDown,
      title: 'Switching to Annual Plans',
      description: 'Consider yearly plans for frequently used services',
      action: 'Could save up to 20% annually'
    })
  }

  const upcomingRenewals = subscriptions.filter(sub => {
    if (!sub.next_billing_date) return false
    const daysUntil = Math.floor((new Date(sub.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24))
    return daysUntil <= 7 && daysUntil >= 0
  })

  if (upcomingRenewals.length > 0) {
    insights.push({
      type: 'info',
      icon: Calendar,
      title: 'Upcoming Renewals',
      description: `${upcomingRenewals.length} subscription${upcomingRenewals.length > 1 ? 's' : ''} renewing this week`,
      action: upcomingRenewals.map(s => s.service_name).join(', ')
    })
  }

  if (unusedSubs.length === 0 && subscriptions.length > 0) {
    insights.push({
      type: 'success',
      icon: CheckCircle,
      title: 'All Active',
      description: 'All your subscriptions are being used regularly',
      action: 'Keep up the good work!'
    })
  }

  if (insights.length === 0) return null

  return (
    <div style={{ marginBottom: '28px' }}>
      <h2 style={{
        color: 'var(--color-text)',
        fontSize: '20px',
        fontWeight: 700,
        marginBottom: '16px'
      }}>
        Smart Insights
      </h2>
      <div className="grid grid-2">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          const bgColor = {
            warning: 'rgba(196, 73, 0, 0.15)',
            info: 'rgba(239, 214, 172, 0.1)',
            success: 'rgba(24, 58, 55, 0.3)'
          }[insight.type]

          const borderColor = {
            warning: 'var(--color-danger)',
            info: 'var(--color-border)',
            success: 'var(--color-accent)'
          }[insight.type]

          return (
            <div
              key={index}
              className="card"
              style={{
                background: bgColor,
                borderLeft: `4px solid ${borderColor}`
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  background: 'var(--card-background)',
                  padding: '10px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={22} color={borderColor} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '6px'
                  }}>
                    {insight.title}
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                    marginBottom: '8px'
                  }}>
                    {insight.description}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: borderColor
                  }}>
                    {insight.action}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default InsightsPanel
