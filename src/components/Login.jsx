import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Mail, Lock, Chrome } from 'lucide-react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Success! Check your email for confirmation.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) alert(error.message)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #04151F 0%, #183A37 100%)'
    }}>
      <div className="card" style={{ maxWidth: '420px', width: '90%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#EFD6AC', marginBottom: '8px' }}>
            SaaS Cost Optimizer
          </h2>
          <p style={{ color: 'rgba(239, 214, 172, 0.6)', fontSize: '14px' }}>
            {isSignUp ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} />
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} />
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px', 
          fontSize: '13px', 
          color: 'rgba(239, 214, 172, 0.6)' 
        }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ 
              marginLeft: '6px', 
              color: '#C44900', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '20px',
          color: 'rgba(239, 214, 172, 0.4)',
          fontSize: '12px',
          fontWeight: 600
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(239, 214, 172, 0.2)' }}></div>
          OR
          <div style={{ flex: 1, height: '1px', background: 'rgba(239, 214, 172, 0.2)' }}></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Chrome size={16} />
          Continue with Google
        </button>
      </div>
    </div>
  )
}

export default Login