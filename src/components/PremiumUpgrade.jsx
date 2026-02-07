import { useState } from 'react'
import { Crown, Check, X } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '../lib/supabaseClient'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const PremiumUpgrade = ({ currentTier, onClose }) => {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
  try {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      alert('Please sign in first')
      return
    }

    console.log('Calling create-checkout with session token')

    const response = await supabase.functions.invoke('create-checkout', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: {
        priceId: 'price_1SttkBDVaUwpJu7xw626ECjN', // ⚠️ Replace with your actual Price ID
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
      },
    })

console.log('Response:', JSON.stringify(response, null, 2))

    if (response.error) {
      console.error('Function error:', response.error)
      throw response.error
    }

    const { url } = response.data
    if (url) {
      window.location.href = url
    } else {
      throw new Error('No checkout URL returned')
    }

  } catch (error) {
    console.error('Error:', error)
    alert('Failed to start checkout: ' + (error.message || 'Please try again'))
  } finally {
    setLoading(false)
  }
}


  const features = {
    free: [
      'Up to 10 subscriptions',
      'Basic analytics',
      'Email parsing',
      'Manual usage tracking',
    ],
    premium: [
      'Unlimited subscriptions',
      'Advanced analytics',
      'Automatic usage tracking (GitHub)',
      'Export reports (CSV/PDF)',
      'Smart recommendations',
      'Email alerts',
      'Priority support',
    ],
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        border: '2px solid #333',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#333',
            border: 'none',
            cursor: 'pointer',
            color: '#fff',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = '#444'}
          onMouseLeave={(e) => e.target.style.background = '#333'}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Crown size={56} color="var(--color-danger)" style={{ marginBottom: '16px' }} />
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: 800, 
            marginBottom: '8px',
            color: '#fff',
          }}>
            Upgrade to Premium
          </h2>
          <p style={{ color: '#999', fontSize: '18px' }}>
            Unlock advanced features and save more money
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
        }}>
          {/* Free Tier */}
          <div style={{
            border: '2px solid #333',
            borderRadius: '16px',
            padding: '32px',
            background: '#111',
            opacity: currentTier === 'premium' ? 0.6 : 1,
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '28px', 
                fontWeight: 700, 
                marginBottom: '8px',
                color: '#fff',
              }}>
                Free
              </h3>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 800, 
                marginBottom: '4px',
                color: '#EFD6AC',
              }}>
                ₹0
              </div>
              <p style={{ color: '#666', fontSize: '16px' }}>
                Forever free
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
              {features.free.map((feature, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  fontSize: '15px',
                  color: '#ccc',
                }}>
                  <Check size={20} color="#4ade80" strokeWidth={3} />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              disabled
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '2px solid #333',
                background: '#222',
                color: '#666',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'not-allowed',
              }}
            >
              Current Plan
            </button>
          </div>

          {/* Premium Tier */}
          <div style={{
            border: '3px solid var(--color-danger)',
            borderRadius: '16px',
            padding: '32px',
            background: 'linear-gradient(135deg, rgba(255, 119, 0, 0.15) 0%, rgba(255, 200, 0, 0.15) 100%)',
            position: 'relative',
          }}>
            {currentTier !== 'premium' && (
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, var(--color-danger) 0%, #FFC800 100%)',
                color: 'white',
                padding: '6px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.5px',
              }}>
                RECOMMENDED
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '28px', 
                fontWeight: 700, 
                marginBottom: '8px',
                color: '#fff',
              }}>
                Premium
              </h3>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 800, 
                marginBottom: '4px',
                color: 'var(--color-danger)',
              }}>
                ₹299
              </div>
              <p style={{ color: '#999', fontSize: '16px' }}>
                Per month
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
              {features.premium.map((feature, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  fontSize: '15px',
                  color: '#fff',
                  fontWeight: 500,
                }}>
                  <Check size={20} color="var(--color-danger)" strokeWidth={3} />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading || currentTier === 'premium'}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: currentTier === 'premium' 
                  ? '#4ade80' 
                  : 'linear-gradient(135deg, var(--color-danger) 0%, var(--color-text-muted) 100%',
                color: 'white',
                fontSize: '18px',
                fontWeight: 800,
                cursor: loading || currentTier === 'premium' ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 20px rgba(255, 119, 0, 0.4)',
              }}
              onMouseEnter={(e) => {
                if (!loading && currentTier !== 'premium') {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 30px rgba(255, 119, 0, 0.6)'
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 20px rgba(255, 119, 0, 0.4)'
              }}
            >
              {loading ? 'Loading...' : 
               currentTier === 'premium' ? '✓ Active' : 'Upgrade Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PremiumUpgrade
