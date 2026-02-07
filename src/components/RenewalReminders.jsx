import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Bell, Mail, Calendar, Settings, Check } from 'lucide-react'

function RenewalReminders() {
  const [reminders, setReminders] = useState([])
  const [settings, setSettings] = useState({
    enabled: true,
    days_before: 7,
    email_enabled: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUpcomingRenewals()
    fetchReminderSettings()
  }, [])

  const fetchUpcomingRenewals = async () => {
    try {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*')
        .not('next_billing_date', 'is', null)
        .order('next_billing_date', { ascending: true })

      if (subs) {
        const today = new Date()
        const upcoming = subs.filter(sub => {
          const billingDate = new Date(sub.next_billing_date)
          const daysUntil = Math.ceil((billingDate - today) / (1000 * 60 * 60 * 24))
          return daysUntil > 0 && daysUntil <= 30
        })
        setReminders(upcoming)
      }
    } catch (error) {
      console.error('Error fetching renewals:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReminderSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // ✅ FIXED: Removed .single() - now returns array
      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.id)
        // NO .single() here!

      if (error) {
        console.error('Error fetching settings:', error)
        return
      }

      // ✅ Check if array has data
      if (data && data.length > 0) {
        const userSettings = data[0] // Get first row
        setSettings({
          enabled: userSettings.enabled,
          days_before: userSettings.days_before,
          email_enabled: userSettings.email_enabled
        })
      } else {
        console.log('No settings found, using defaults')
      }
    } catch (error) {
      console.log('Using default reminder settings:', error)
    }
  }

  const saveReminderSettings = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('⚠️ Please log in to save settings')
        return
      }

      const { error } = await supabase
        .from('reminder_settings')
        .upsert({
          user_id: user.id,
          enabled: settings.enabled,
          days_before: settings.days_before,
          email_enabled: settings.email_enabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error
      alert('✅ Reminder settings saved!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('⚠️ Could not save settings: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const getDaysUntilRenewal = (dateString) => {
    const today = new Date()
    const renewalDate = new Date(dateString)
    return Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div style={{
        background: 'var(--card-background)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '28px',
        border: '1px solid var(--color-border)',
        textAlign: 'center'
      }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--card-background)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '28px',
      border: '1px solid var(--color-border)'
    }}>
      <h3 style={{
        color: 'var(--color-text)',
        fontSize: '20px',
        fontWeight: 700,
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Bell size={24} />
        Renewal Reminders
      </h3>

      {/* Settings */}
      <div style={{
        background: 'rgba(26, 26, 26, 0.5)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          color: 'var(--color-text)',
          fontSize: '15px',
          fontWeight: 600
        }}>
          <Settings size={18} />
          Notification Settings
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Enable/Disable */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            color: 'var(--color-text)',
            fontSize: '14px'
          }}>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Enable renewal reminders
          </label>

          {/* Days before */}
          <div>
            <label style={{
              display: 'block',
              color: 'var(--color-text-muted)',
              fontSize: '13px',
              marginBottom: '8px'
            }}>
              Remind me (days before renewal):
            </label>
            <select
              value={settings.days_before}
              onChange={(e) => setSettings({...settings, days_before: parseInt(e.target.value)})}
              disabled={!settings.enabled}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'rgba(26, 26, 26, 0.5)',
                color: 'var(--color-text)',
                fontSize: '14px',
                cursor: 'pointer',
                width: '200px'
              }}
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>

          {/* Email notifications */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            color: 'var(--color-text)',
            fontSize: '14px'
          }}>
            <input
              type="checkbox"
              checked={settings.email_enabled}
              onChange={(e) => setSettings({...settings, email_enabled: e.target.checked})}
              disabled={!settings.enabled}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <Mail size={16} />
            Send email notifications
          </label>

          <button
            onClick={saveReminderSettings}
            disabled={saving}
            className="btn btn-primary"
            style={{
              width: 'fit-content',
              padding: '10px 24px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Check size={16} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upcoming Renewals */}
      <div>
        <h4 style={{
          color: 'var(--color-text)',
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Calendar size={18} />
          Upcoming Renewals (Next 30 Days)
        </h4>

        {reminders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px',
            color: 'var(--color-text-muted)',
            fontSize: '14px'
          }}>
            <Calendar size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No upcoming renewals in the next 30 days</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reminders.map((sub) => {
              const daysUntil = getDaysUntilRenewal(sub.next_billing_date)
              const isUrgent = daysUntil <= 7

              return (
                <div
                  key={sub.id}
                  style={{
                    background: isUrgent 
                      ? 'rgba(255, 152, 0, 0.1)' 
                      : 'rgba(26, 26, 26, 0.5)',
                    border: `1px solid ${isUrgent ? 'rgba(255, 152, 0, 0.3)' : 'var(--color-border)'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{
                      color: 'var(--color-text)',
                      fontSize: '15px',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}>
                      {sub.service_name}
                    </div>
                    <div style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '13px'
                    }}>
                      ₹{sub.monthly_cost} • {sub.billing_cycle}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      color: isUrgent ? '#FF9800' : 'var(--color-accent)',
                      fontSize: '15px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}>
                      {daysUntil === 0 ? 'Today' : 
                       daysUntil === 1 ? 'Tomorrow' : 
                       `${daysUntil} days`}
                    </div>
                    <div style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '12px'
                    }}>
                      {new Date(sub.next_billing_date).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
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

export default RenewalReminders
