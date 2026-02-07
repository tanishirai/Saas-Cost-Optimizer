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
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)', // ✅ Equal width columns
      gap: 'clamp(6px, 2vw, 12px)',
      marginBottom: 'clamp(16px, 3vw, 32px)',
      padding: 'clamp(6px, 2vw, 8px)',
      background: 'var(--card-background)',
      borderRadius: 'clamp(12px, 3vw, 16px)',
      border: '1px solid var(--color-border)',
      backdropFilter: 'blur(20px)',
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: 'clamp(10px, 2.5vw, 14px) clamp(8px, 2vw, 20px)',
              background: isActive 
                ? 'linear-gradient(135deg, var(--color-muted) 0%, var(--color-danger) 100%)'
                : 'transparent',
              border: 'none',
              borderRadius: 'clamp(8px, 2vw, 12px)',
              color: isActive ? '#EFD6AC' : 'var(--color-text-muted)',
              fontWeight: isActive ? 700 : 500,
              fontSize: 'clamp(0px, 3vw, 15px)', // ✅ Scales from 0 (mobile) to 15px (desktop)
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              flexDirection: 'column', // ✅ Stack icon and text
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(2px, 1vw, 8px)',
              whiteSpace: 'nowrap',
              minHeight: '44px', // ✅ Touch-friendly minimum
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
            <Icon size={window.innerWidth < 768 ? 18 : 20} />
            <span style={{ 
              fontSize: 'clamp(0px, 3vw, 15px)',
              lineHeight: 1,
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
