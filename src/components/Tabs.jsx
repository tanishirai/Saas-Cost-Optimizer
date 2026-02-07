import { LayoutDashboard, CreditCard, Zap, FileText } from 'lucide-react'

function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'reports', label: 'Reports', icon: FileText }
  ]

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '32px',
      padding: '8px',
      background: 'var(--card-background)',
      borderRadius: '16px',
      border: '1px solid var(--color-border)',
      backdropFilter: 'blur(20px)'
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '14px 20px',
              background: isActive 
                ? 'linear-gradient(135deg, var(--color-muted) 0%, var(--color-danger) 100%)'
                : 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: isActive ? '#0f0f0f' : 'var(--color-text-muted)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(239, 214, 172, 0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <Icon size={20} />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
