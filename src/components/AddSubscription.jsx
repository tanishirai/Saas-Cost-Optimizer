import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X, DollarSign, Tag, Calendar, Clock } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

function AddSubscription({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    service_name: '',
    category: 'Other',
    monthly_cost: '',
    billing_cycle: 'monthly',
    last_used: new Date(),
    next_billing_date: null
  })
  const [loading, setLoading] = useState(false)

  const categories = [
    'Streaming', 
    'Development', 
    'Design', 
    'Productivity', 
    'AI', 
    'Cloud Storage',
    'Other'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('subscriptions')
        .insert([{
          service_name: formData.service_name,
          category: formData.category,
          monthly_cost: parseFloat(formData.monthly_cost),
          billing_cycle: formData.billing_cycle,
          last_used: formData.last_used.toISOString().split('T')[0],
          next_billing_date: formData.next_billing_date ? formData.next_billing_date.toISOString().split('T')[0] : null,
          user_id: user.id
        }])

      if (error) throw error
      
      onSuccess()
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#EFD6AC', marginBottom: '6px' }}>
              Add Subscription
            </h2>
            <p style={{ color: 'rgba(239, 214, 172, 0.6)', fontSize: '13px' }}>Track a new service expense</p>
          </div>
          <button onClick={onClose} className="icon-button">
            <X size={22} color="#EFD6AC" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <Tag size={14} />
              Service Name
            </label>
            <input
              type="text"
              name="service_name"
              placeholder="Netflix, GitHub Pro, Figma"
              value={formData.service_name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Tag size={14} />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <DollarSign size={14} />
              Cost (₹)
            </label>
            <input
              type="number"
              name="monthly_cost"
              placeholder="699"
              value={formData.monthly_cost}
              onChange={handleChange}
              className="input"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Calendar size={14} />
              Billing Cycle
            </label>
            <select
              name="billing_cycle"
              value={formData.billing_cycle}
              onChange={handleChange}
              className="input"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <Clock size={14} />
              Last Used
            </label>
            <DatePicker
              selected={formData.last_used}
              onChange={(date) => setFormData({ ...formData, last_used: date })}
              dateFormat="dd-MM-yyyy"
              maxDate={new Date()}
              className="input"
              wrapperClassName="datepicker-wrapper"
            />
          </div>

          <div className="form-group">
            <label>
              <Calendar size={14} />
              Next Billing Date
            </label>
            <DatePicker
              selected={formData.next_billing_date}
              onChange={(date) => setFormData({ ...formData, next_billing_date: date })}
              dateFormat="dd-MM-yyyy"
              minDate={new Date()}
              className="input"
              placeholderText="Select date"
              wrapperClassName="datepicker-wrapper"
              isClearable
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-ghost"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddSubscription
