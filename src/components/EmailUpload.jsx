import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Mail, Upload, CheckCircle, AlertCircle } from 'lucide-react'

function EmailUpload({ onSuccess }) {
  const [emailText, setEmailText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleParse = async () => {
    setLoading(true)
    setResult(null)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error('Session error: ' + sessionError.message)
      }

      if (!session) {
        throw new Error('Please log in again')
      }

      console.log('Calling function...')

      const response = await fetch(
        'https://dagsaohdehysplnqyaou.supabase.co/functions/v1/parse-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            emailBody: emailText
          })
        }
      )

      console.log('Response status:', response.status)

      const data = await response.json()
      console.log('Function response:', data)

      if (data.success) {
        setResult({ 
          type: 'success', 
          message: `✓ Added ${data.subscription.service} - ₹${data.subscription.amount}` 
        })
        setEmailText('')
        setTimeout(() => {
          onSuccess()
          setResult(null)
        }, 2000)
      } else {
        setResult({ 
          type: 'error', 
          message: data.error || data.message || 'Could not parse email' 
        })
      }
    } catch (error) {
      console.error('Parse error:', error)
      setResult({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ marginBottom: '28px' }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--color-text)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Mail size={20} />
        Import from Email Receipt
      </h3>

      <p style={{
        fontSize: '13px',
        color: 'var(--color-text-muted)',
        marginBottom: '16px'
      }}>
        Paste your subscription receipt email (Netflix, Spotify, GitHub, OpenAI, etc.)
      </p>

      <textarea
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
        placeholder="Example:&#10;&#10;Your Netflix subscription has been renewed.&#10;Total: ₹649&#10;Next billing: March 26, 2026"
        className="input"
        rows={8}
        style={{
          resize: 'vertical',
          fontFamily: 'monospace',
          fontSize: '12px',
          lineHeight: '1.6'
        }}
      />

      <button
        onClick={handleParse}
        disabled={!emailText.trim() || loading}
        className="btn btn-primary"
        style={{
          marginTop: '16px',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <Upload size={16} />
        {loading ? 'Parsing Email...' : 'Parse & Add Subscription'}
      </button>

      {result && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: result.type === 'success'
            ? 'rgba(24, 58, 55, 0.3)'
            : 'rgba(196, 73, 0, 0.15)',
          border: `1px solid ${result.type === 'success' ? 'var(--color-accent)' : 'var(--color-danger)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--color-text)',
          fontSize: '14px',
          fontWeight: 600
        }}>
          {result.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {result.message}
        </div>
      )}
            <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(239, 214, 172, 0.05)',
        borderRadius: '8px',
        fontSize: '13px',
        color: 'var(--color-text-muted)'
      }}>
        💡 <strong>Tip:</strong> We can detect Netflix, Spotify, Amazon Prime, GitHub, OpenAI, Notion, and more!
      </div>

    </div>
  )
}

export default EmailUpload
