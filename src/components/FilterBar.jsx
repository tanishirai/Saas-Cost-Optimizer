import { useState } from 'react'
import { Search, Filter, Download, FileText } from 'lucide-react'
import { exportToCSV, exportSummaryReport } from '../utils/exportUtils'

function FilterBar({ subscriptions, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCycle, setSelectedCycle] = useState('all')
  const [showExportMenu, setShowExportMenu] = useState(false)

  const categories = ['all', 'Streaming', 'Development', 'Design', 'Productivity', 'AI', 'Cloud Storage', 'Other']
  const cycles = ['all', 'monthly', 'yearly']

  const applyFilters = (search, category, cycle) => {
    const filtered = subscriptions.filter(sub => {
      const matchesSearch = sub.service_name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || sub.category === category
      const matchesCycle = cycle === 'all' || sub.billing_cycle === cycle
      return matchesSearch && matchesCategory && matchesCycle
    })
    onFilterChange(filtered)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    applyFilters(value, selectedCategory, selectedCycle)
  }

  const handleCategoryChange = (e) => {
    const value = e.target.value
    setSelectedCategory(value)
    applyFilters(searchTerm, value, selectedCycle)
  }

  const handleCycleChange = (e) => {
    const value = e.target.value
    setSelectedCycle(value)
    applyFilters(searchTerm, selectedCategory, value)
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="input"
            style={{ paddingLeft: '42px' }}
          />
        </div>

        <div style={{ flex: '0 1 180px', position: 'relative' }}>
          <Filter
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
              zIndex: 1
            }}
          />
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="input"
            style={{ paddingLeft: '42px' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: '0 1 160px' }}>
          <select
            value={selectedCycle}
            onChange={handleCycleChange}
            className="input"
          >
            {cycles.map(cycle => (
              <option key={cycle} value={cycle}>
                {cycle === 'all' ? 'All Cycles' : cycle.charAt(0).toUpperCase() + cycle.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} />
            Export
          </button>

          {showExportMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'var(--card-background)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '8px',
              minWidth: '180px',
              zIndex: 100,
              boxShadow: 'var(--shadow-md)'
            }}>
              <button
                onClick={() => {
                  exportToCSV(subscriptions)
                  setShowExportMenu(false)
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--input-background)'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={() => {
                  exportSummaryReport(subscriptions)
                  setShowExportMenu(false)
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--input-background)'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                <FileText size={16} />
                Export Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilterBar
