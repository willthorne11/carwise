import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // Check env vars first
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase env vars')
    return res.status(500).json({ error: 'Server configuration error — missing Supabase credentials' })
  }

  // Create client with service role key — bypasses RLS completely
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { userId, type, input, result } = req.body

  if (!userId) return res.status(400).json({ error: 'Missing userId' })
  if (!type) return res.status(400).json({ error: 'Missing type' })
  if (!result) return res.status(400).json({ error: 'Missing result' })

  try {
    const { data, error } = await supabase
      .from('searches')
      .insert({
        user_id: userId,
        type,
        input: input || {},
        result: result,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', JSON.stringify(error))
      return res.status(500).json({ error: error.message, code: error.code, details: error.details })
    }

    return res.status(200).json({ success: true, id: data.id })
  } catch (e) {
    console.error('Unexpected error:', e)
    return res.status(500).json({ error: e.message })
  }
}
