import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    let event

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      console.log('⚠️ No webhook secret, processing anyway')
      event = JSON.parse(body)
    }

    console.log('📥 Webhook event:', event.type)

    // Handle successful checkout
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.metadata?.supabase_user_id
      
      console.log('✅ Checkout completed for user:', userId)

      if (userId) {
        // Update user tier to premium
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_tier: 'premium',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('id', userId)

        if (error) {
          console.error('❌ Error updating profile:', error)
          throw error
        }
        
        console.log('✅ User upgraded to premium')

        // Record payment
        await supabase.from('payments').insert({
          user_id: userId,
          stripe_payment_id: session.payment_intent,
          amount: session.amount_total,
          currency: session.currency?.toUpperCase() || 'INR',
          status: 'succeeded',
          subscription_tier: 'premium'
        })

        console.log('✅ Payment recorded')
      }
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      
      console.log('🔻 Subscription deleted:', subscription.id)

      // Find user by stripe subscription ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({ 
            subscription_tier: 'free',
            stripe_subscription_id: null,
            premium_expires_at: null
          })
          .eq('id', profile.id)
        
        console.log('✅ User downgraded to free')
      }
    }

    // Handle subscription updated
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object
      
      console.log('🔄 Subscription updated:', subscription.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (profile) {
        // Update expiry based on current period end
        const expiryDate = new Date(subscription.current_period_end * 1000).toISOString()
        
        await supabase
          .from('profiles')
          .update({ 
            premium_expires_at: expiryDate,
            subscription_tier: subscription.status === 'active' ? 'premium' : 'free'
          })
          .eq('id', profile.id)
        
        console.log('✅ Subscription updated')
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('❌ Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
