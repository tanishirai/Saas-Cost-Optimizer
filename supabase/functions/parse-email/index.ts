import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const { emailBody } = await req.json()

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Create Supabase client with service role (bypasses RLS for this operation)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      console.error('Auth error:', userError)
      throw new Error('Invalid or expired session. Please log in again.')
    }

    console.log('Authenticated user:', user.email)

    // Parse the email
    const parsed = parseSubscriptionEmail(emailBody)

    if (!parsed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Could not detect subscription details. Make sure the email contains service name and amount.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Parsed subscription:', parsed)

    // Insert into database
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert([{
        user_id: user.id,
        service_name: parsed.service,
        monthly_cost: parsed.amount,
        billing_cycle: parsed.cycle,
        category: parsed.category,
        last_used: new Date().toISOString().split('T')[0],
        next_billing_date: parsed.nextBilling
      }])
      .select()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to save subscription: ' + error.message)
    }

    console.log('Successfully saved subscription')

    return new Response(
      JSON.stringify({ success: true, subscription: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function parseSubscriptionEmail(emailBody: string) {
  const text = emailBody.toLowerCase()

  let service = 'Unknown'
  let amount = 0
  let category = 'Other'
  let cycle = 'monthly'

  // Detect service
  if (text.includes('netflix')) {
    service = 'Netflix'
    category = 'Streaming'
  } else if (text.includes('spotify')) {
    service = 'Spotify'
    category = 'Streaming'
  } else if (text.includes('github')) {
    service = 'GitHub'
    category = 'Development'
  } else if (text.includes('openai') || text.includes('chatgpt')) {
    service = 'OpenAI'
    category = 'AI'
  } else if (text.includes('figma')) {
    service = 'Figma'
    category = 'Design'
  } else if (text.includes('amazon prime') || text.includes('prime video')) {
    service = 'Amazon Prime'
    category = 'Streaming'
  } else if (text.includes('adobe')) {
    service = 'Adobe'
    category = 'Design'
  } else if (text.includes('microsoft') || text.includes('office 365')) {
    service = 'Microsoft 365'
    category = 'Productivity'
  }

  // Extract amount - multiple patterns
  const amountPatterns = [
    /total[:\s]+[₹$]\s*(\d+(?:\.\d{1,2})?)/i,
    /amount[:\s]+[₹$]\s*(\d+(?:\.\d{1,2})?)/i,
    /charged[:\s]+[₹$]\s*(\d+(?:\.\d{1,2})?)/i,
    /payment[:\s]+[₹$]\s*(\d+(?:\.\d{1,2})?)/i,
    /price[:\s]+[₹$]\s*(\d+(?:\.\d{1,2})?)/i,
    /[₹$]\s*(\d+(?:\.\d{1,2})?)/,
    /rs\.?\s*(\d+(?:\.\d{1,2})?)/i,
  ]

  for (const pattern of amountPatterns) {
    const match = text.match(pattern)
    if (match) {
      amount = parseFloat(match[1])
      break
    }
  }

  // Detect billing cycle
  if (text.includes('annual') || text.includes('yearly') || text.includes('year') || text.includes('12 month')) {
    cycle = 'yearly'
  }

  // Calculate next billing date (30 days from now for monthly, 365 for yearly)
  const nextBilling = new Date()
  nextBilling.setDate(nextBilling.getDate() + (cycle === 'yearly' ? 365 : 30))

  // Only return if we found both service and amount
  if (service !== 'Unknown' && amount > 0) {
    return {
      service,
      amount,
      category,
      cycle,
      nextBilling: nextBilling.toISOString().split('T')[0]
    }
  }

  return null
}
