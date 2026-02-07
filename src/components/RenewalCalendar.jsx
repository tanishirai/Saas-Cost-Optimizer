import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

function RenewalCalendar({ subscriptions }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const getRenewalsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    return subscriptions.filter(sub => {
      if (!sub.next_billing_date) return false
      const subDate = sub.next_billing_date.split('T')[0]
      return subDate === dateStr
    })
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const days = []
  
  // Empty cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} style={{ padding: '12px' }} />)
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const renewals = getRenewalsForDay(day)
    const isToday = new Date().getDate() === day && 
                    new Date().getMonth() === month && 
                    new Date().getFullYear() === year

    days.push(
      <div
        key={day}
        style={{
          padding: '8px',
          borderRadius: '8px',
          background: renewals.length > 0 
            ? 'rgba(239, 214, 172, 0.15)' 
            : isToday 
            ? 'rgba(239, 214, 172, 0.08)' 
            : 'transparent',
          border: isToday ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
          minHeight: '80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          position: 'relative'
        }}
      >
        <div style={{
          fontSize: '14px',
          fontWeight: isToday ? 700 : 600,
          color: renewals.length > 0 ? 'var(--color-accent)' : 'var(--color-text)',
          marginBottom: '4px'
        }}>
          {day}
        </div>

        {renewals.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {renewals.slice(0, 2).map(sub => (
              <div
                key={sub.id}
                title={`${sub.service_name} - ₹${sub.monthly_cost}`}
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  background: 'var(--color-accent)',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {sub.service_name}
              </div>
            ))}
            {renewals.length > 2 && (
              <div style={{
                fontSize: '9px',
                color: 'var(--color-text-muted)',
                fontWeight: 600
              }}>
                +{renewals.length - 2} more
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Get renewals for current month
  const thisMonthRenewals = subscriptions.filter(sub => {
    if (!sub.next_billing_date) return false
    const subDate = new Date(sub.next_billing_date)
    return subDate.getMonth() === month && subDate.getFullYear() === year
  }).sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date))

  return (
    <div style={{
      background: 'var(--card-background)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '28px',
      border: '1px solid var(--color-border)',
      marginBottom: '28px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h3 style={{
          color: 'var(--color-text)',
          fontSize: '20px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Calendar size={24} />
          Renewal Calendar
        </h3>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={previousMonth}
            className="icon-button"
            style={{
              padding: '8px',
              background: 'rgba(239, 214, 172, 0.1)',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={20} color="var(--color-text)" />
          </button>

          <div style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--color-text)',
            minWidth: '150px',
            textAlign: 'center'
          }}>
            {monthNames[month]} {year}
          </div>

          <button
            onClick={nextMonth}
            className="icon-button"
            style={{
              padding: '8px',
              background: 'rgba(239, 214, 172, 0.1)',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronRight size={20} color="var(--color-text)" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        marginBottom: '12px'
      }}>
        {dayNames.map(day => (
          <div
            key={day}
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              padding: '8px'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        marginBottom: '24px'
      }}>
        {days}
      </div>

      {/* Upcoming Renewals Summary */}
      <div style={{
        padding: '20px',
        background: 'rgba(239, 214, 172, 0.08)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📋 Renewals in {monthNames[month]} {year}
        </h4>

        {thisMonthRenewals.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            fontWeight: 600
          }}>
            No renewals this month 🎉
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {thisMonthRenewals.map(sub => {
              const subDate = new Date(sub.next_billing_date)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const daysUntil = Math.ceil((subDate - today) / (1000 * 60 * 60 * 24))
              const isUpcoming = daysUntil >= 0 && daysUntil <= 7

              return (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px',
                    background: isUpcoming 
                      ? 'rgba(239, 214, 172, 0.15)' 
                      : 'rgba(239, 214, 172, 0.05)',
                    borderRadius: '10px',
                    border: `1px solid ${isUpcoming ? 'var(--color-accent)' : 'var(--color-border)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--color-accent)',
                      minWidth: '40px',
                      textAlign: 'center',
                      background: 'rgba(239, 214, 172, 0.2)',
                      padding: '8px',
                      borderRadius: '8px'
                    }}>
                      {subDate.getDate()}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        marginBottom: '2px'
                      }}>
                        {sub.service_name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        fontWeight: 600
                      }}>
                        {subDate.toLocaleDateString('en-IN', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isUpcoming && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--color-accent)',
                        background: 'rgba(239, 214, 172, 0.25)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'TOMORROW' : `${daysUntil} DAYS`}
                      </span>
                    )}
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--color-text)'
                    }}>
                      ₹{parseFloat(sub.monthly_cost).toFixed(0)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default RenewalCalendar
