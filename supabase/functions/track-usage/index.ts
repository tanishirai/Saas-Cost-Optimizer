import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { service, githubUsername } = await req.json()
    console.log('📊 Tracking:', service, 'for:', githubUsername)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get('Authorization')
    let user = null
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data } = await supabaseAdmin.auth.getUser(token)
      user = data?.user
    }

    if (!user) {
      const { data: users } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('service_name', service)
        .limit(1)
      
      if (users && users.length > 0) {
        user = { id: users[0].user_id }
      }
    }

    if (!user) {
      throw new Error('Cannot determine user')
    }

    console.log('✅ User ID:', user.id)

    let usageData = {}
    let usageScore = 0

    if (service === 'GitHub' && githubUsername) {
      console.log('🔍 Fetching repos for:', githubUsername)
      
      const reposRes = await fetch(
        `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'SubSense-App'
          }
        }
      )

      if (!reposRes.ok) {
        throw new Error(`GitHub API error: ${reposRes.status}`)
      }

      const repos = await reposRes.json()
      console.log('📦 Total repos:', repos.length)

      // CHANGED: Use 90 days instead of 30
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      console.log('📅 Checking since:', ninetyDaysAgo.toISOString().split('T')[0])

      let activeRepos = 0
      let totalCommits = 0

      // Filter repos updated in last 90 days
      const recentRepos = repos.filter((r: any) => {
        const updatedAt = new Date(r.updated_at)
        return updatedAt >= ninetyDaysAgo && !r.fork
      })

      console.log('📂 Repos updated in last 90 days:', recentRepos.length)

      // Check top 10 repos for commits
      for (const repo of recentRepos.slice(0, 10)) {
        activeRepos++
        
        try {
          const commitsRes = await fetch(
            `https://api.github.com/repos/${repo.full_name}/commits?author=${githubUsername}&since=${ninetyDaysAgo.toISOString()}&per_page=100`,
            {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'SubSense-App'
              }
            }
          )

          if (commitsRes.ok) {
            const commits = await commitsRes.json()
            totalCommits += commits.length
            console.log(`  ✓ ${repo.name}: ${commits.length} commits`)
          }
        } catch (e) {
          console.log(`  ✗ ${repo.name}: error`)
        }

        await new Promise(r => setTimeout(r, 500))
      }

      console.log('💻 Total commits:', totalCommits)
      console.log('📦 Active repos:', activeRepos)

      usageData = {
        commits: totalCommits,
        pullRequests: 0,
        activeRepos: activeRepos,
        totalRepos: repos.length,
        checkedAt: new Date().toISOString()
      }

      // Score: 1pt per commit, 4pts per active repo
      usageScore = Math.min(100, totalCommits + (activeRepos * 4))
      console.log('📈 Score:', usageScore)
    }

    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({ 
        usage_score: usageScore,
        usage_data: usageData,
        last_used: new Date().toISOString().split('T')[0]
      })
      .eq('user_id', user.id)
      .eq('service_name', service)

    if (updateError) {
      throw updateError
    }

    console.log('✅ Updated!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        usageData, 
        usageScore 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error:', error.message)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
