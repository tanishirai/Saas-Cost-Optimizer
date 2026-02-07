import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Landing from './pages/Landing'
import Login from './components/Login'
import Dashboard from './components/Dashboard'


function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })


    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })


    return () => subscription.unsubscribe()
  }, [])


  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0f0f0f'
      }}>
        <div className="spinner"></div>
      </div>
    )
  }


  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page - Shows when NOT logged in */}
        <Route 
          path="/" 
          element={session ? <Navigate to="/dashboard" replace /> : <Landing />} 
        />
        
        {/* Login Page */}
        <Route 
          path="/login" 
          element={session ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        
        {/* Dashboard - Protected, shows when logged in */}
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard /> : <Navigate to="/" replace />} 
        />
      </Routes>
    </BrowserRouter>
  )
}


export default App
