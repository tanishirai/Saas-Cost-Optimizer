import { useState } from 'react'
import { Download } from 'lucide-react'
import { exportToCSV, formatSubscriptionsForExport, exportToPDF } from '../utils/exportUtils'

function ReportsSection({ subscriptions, profile }) {
  const [sortBy, setSortBy] = useState('name-asc')

  // Sort subscriptions
  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    switch (sortBy) {
      case 'cost-desc':
        return parseFloat(b.monthly_cost) - parseFloat(a.monthly_cost)
      case 'cost-asc':
        return parseFloat(a.monthly_cost) - parseFloat(b.monthly_cost)
      case 'name-asc':
        return a.service_name.localeCompare(b.service_name)
      case 'date-recent':
        return new Date(b.created_at) - new Date(a.created_at)
      default:
        return 0
    }
  })

  // Calculate category breakdown
  const categoryBreakdown = subscriptions.reduce((acc, sub) => {
    const category = sub.category || 'Other'
    const cost = parseFloat(sub.monthly_cost) || 0
    const monthlyCost = sub.billing_cycle === 'yearly' ? cost / 12 : cost
    
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 }
    }
    acc[category].total += monthlyCost
    acc[category].count += 1
    return acc
  }, {})

  const totalMonthly = Object.values(categoryBreakdown).reduce((sum, cat) => sum + cat.total, 0)

  // Export handlers
  const handleExportSubscriptions = () => {
    if (subscriptions.length === 0) {
      alert('📊 No subscriptions to export')
      return
    }
    const formattedData = formatSubscriptionsForExport(subscriptions)
    const filename = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(formattedData, filename)
  }

  const handleExportPDF = () => {
    if (subscriptions.length === 0) {
      alert('📊 No subscriptions to export')
      return
    }
    if (profile?.subscription_tier !== 'premium') {
      alert('🔒 PDF export is a premium feature. Upgrade to access!')
      return
    }
    try {
      exportToPDF(subscriptions, profile)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('❌ Failed to generate PDF: ' + error.message)
    }
  }

  return (
    <div>
      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div style={{
          background: 'var(--card-background)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Subscriptions
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-accent)' }}>
            {subscriptions.length}
          </div>
        </div>

        <div style={{
          background: 'var(--card-background)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Monthly Cost
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text)' }}>
            ₹{totalMonthly.toFixed(0)}
          </div>
        </div>

        <div style={{
          background: 'var(--card-background)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Categories
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text)' }}>
            {Object.keys(categoryBreakdown).length}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{
        background: 'var(--card-background)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '28px',
        border: '1px solid var(--color-border)',
      }}>
        <h3 style={{
          color: 'var(--color-text)',
          fontSize: '20px',
          fontWeight: 700,
          marginBottom: '20px'
        }}>
          📊 Category Breakdown
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(categoryBreakdown)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([category, data]) => {
              const percentage = (data.total / totalMonthly * 100).toFixed(1)
              return (
                <div key={category} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: 'rgba(239, 214, 172, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      marginBottom: '4px'
                    }}>
                      {category}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      fontWeight: 600
                    }}>
                      {data.count} subscription{data.count !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginLeft: '20px' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--color-accent)',
                      marginBottom: '2px'
                    }}>
                      ₹{data.total.toFixed(0)}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      fontWeight: 700
                    }}>
                      {percentage}%
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Subscription Details Table */}
      <div style={{
        background: 'var(--card-background)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '28px',
        border: '1px solid var(--color-border)',
        marginBottom: '28px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h3 style={{
            color: 'var(--color-text)',
            fontSize: '20px',
            fontWeight: 700,
            margin: 0
          }}>
            📋 Subscription Details
          </h3>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '10px 16px',
              background: 'rgba(26, 26, 26, 0.5)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-text)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="name-asc">Name: A to Z</option>
            <option value="cost-desc">Cost: High to Low</option>
            <option value="cost-asc">Cost: Low to High</option>
            <option value="date-recent">Recently Added</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '600px'
          }}>
            <thead>
              <tr style={{
                borderBottom: '2px solid var(--color-border)'
              }}>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Service</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Category</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Cost</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Cycle</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Next Billing</th>
              </tr>
            </thead>
            <tbody>
              {sortedSubscriptions.map((sub, index) => (
                <tr key={sub.id} style={{
                  borderBottom: '1px solid var(--color-border)',
                  background: index % 2 === 0 ? 'transparent' : 'rgba(239, 214, 172, 0.03)'
                }}>
                  <td style={{
                    padding: '16px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-text)'
                  }}>{sub.service_name}</td>
                  <td style={{
                    padding: '16px'
                  }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--color-accent)',
                      background: 'rgba(239, 214, 172, 0.15)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      {sub.category}
                    </span>
                  </td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'right',
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--color-text)'
                  }}>₹{parseFloat(sub.monthly_cost).toFixed(0)}</td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    textTransform: 'capitalize'
                  }}>{sub.billing_cycle}</td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'right',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap'
                  }}>
                    {sub.next_billing_date 
                      ? new Date(sub.next_billing_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default ReportsSection
