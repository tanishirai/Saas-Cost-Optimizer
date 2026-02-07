import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  IndianRupee,
  TrendingUp, 
  Bell, 
  Mail, 
  BarChart3, 
  Shield,
  Check,
  ArrowRight,
  Crown,
  Sparkles
} from 'lucide-react'
import './Landing.css'

function Landing() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const features = [
    {
      icon: <IndianRupee size={28} />,
      title: 'Track All Subscriptions',
      description: 'Manage all your SaaS subscriptions in one dashboard'
    },
    {
      icon: <TrendingUp size={28} />,
      title: 'Smart Analytics',
      description: 'Visualize spending patterns with beautiful charts'
    },
    {
      icon: <Bell size={28} />,
      title: 'Renewal Reminders',
      description: 'Never miss a payment with intelligent notifications'
    },
    {
      icon: <Mail size={28} />,
      title: 'Email Parsing',
      description: 'Auto-detect subscriptions from your emails'
    },
    {
      icon: <BarChart3 size={28} />,
      title: 'Cost Insights',
      description: 'Identify unused subscriptions and save money'
    },
    {
      icon: <Shield size={28} />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected'
    }
  ]

  const pricingPlans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      badge: null,
      features: [
        'Up to 10 subscriptions',
        'Basic analytics',
        'Email parsing',
        'Manual usage tracking'
      ],
      cta: 'Current Plan',
      highlighted: false
    },
    {
      name: 'Premium',
      price: '₹299',
      period: 'month',
      badge: 'RECOMMENDED',
      features: [
        'Unlimited subscriptions',
        'Advanced analytics',
        'Automatic usage tracking (GitHub)',
        'Export reports (CSV/PDF)',
        'Smart recommendations',
        'Email alerts',
        'Priority support'
      ],
      cta: 'Upgrade Now',
      highlighted: true
    }
  ]

  const handleGetStarted = () => {
    navigate('/login')
  }

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <IndianRupee size={32} strokeWidth={2.5} />
            <span>SaaS Cost Optimizer</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <button onClick={() => navigate('/login')} className="btn-nav-login">
              Sign In
            </button>
            <button onClick={handleGetStarted} className="btn-nav-signup">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Track, Analyze, Save Money</span>
          </div>
          <h1 className="hero-title">
            Stop Wasting Money on<br />
            <span className="gradient-text">Forgotten Subscriptions</span>
          </h1>
          <p className="hero-subtitle">
            Track all your SaaS subscriptions in one place. Get smart insights, 
            renewal reminders, and save thousands annually.
          </p>
          <div className="hero-cta">
            <button onClick={handleGetStarted} className="btn-hero-primary">
              Start Free Trial
              <ArrowRight size={20} />
            </button>
            <button onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })} className="btn-hero-secondary">
              View Pricing
            </button>
          </div>
          <p className="hero-note">
            ✨ No credit card required • Free forever plan available
          </p>
        </div>
        
        <div className="hero-visual">
          <div className="hero-card hero-card-1">
            <div className="card-stat">
              <span className="stat-label">Monthly Spending</span>
              <span className="stat-value">₹2,847</span>
            </div>
          </div>
          <div className="hero-card hero-card-2">
            <div className="card-stat">
              <span className="stat-label">Potential Savings</span>
              <span className="stat-value saving">₹843/mo</span>
            </div>
          </div>
          <div className="hero-card hero-card-3">
            <div className="card-stat">
              <span className="stat-label">Active Subscriptions</span>
              <span className="stat-value">12</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <h2>Everything You Need to Manage Subscriptions</h2>
          <p>Powerful features to help you take control of your spending</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="section-header">
          <h2>Simple, Transparent Pricing</h2>
          <p>Choose the plan that's right for you</p>
        </div>

        <div className="pricing-grid">
          {pricingPlans.map((plan, idx) => (
            <div key={idx} className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}>
              {plan.badge && (
                <div className="pricing-badge">
                  <Crown size={16} />
                  {plan.badge}
                </div>
              )}
              <h3 className="pricing-name">{plan.name}</h3>
              <div className="pricing-price">
                <span className="price-amount">{plan.price}</span>
                <span className="price-period">/{plan.period}</span>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <Check size={20} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={handleGetStarted}
                className={`btn-pricing ${plan.highlighted ? 'primary' : 'secondary'}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Take Control of Your Subscriptions?</h2>
          <p>Join thousands of users saving money every month</p>
          <button onClick={handleGetStarted} className="btn-cta">
            Get Started for Free
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <IndianRupee size={28} />
            <span>SaaS Cost Optimizer</span>
          </div>
          <p className="footer-tagline">
            Smart subscription management for modern teams
          </p>
          <p className="footer-copyright">
            © 2026 SaaS Cost Optimizer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
