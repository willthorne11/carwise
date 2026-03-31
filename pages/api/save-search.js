import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, type, input, result } = req.body

  console.log('save-search called:', { userId, type, hasResult: !!result })

  if (!userId || !type || !result) {
    console.error('Missing fields:', { userId: !!userId, type: !!type, result: !!result })
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const { data, error } = await supabase
    .from('searches')
    .insert([{
      user_id: userId,
      type,
      input: input,
      result: result,
      created_at: new Date().toISOString()
    }])
    .select()

  if (error) {
    console.error('Supabase insert error:', error)
    return res.status(500).json({ error: error.message, details: error })
  }

  console.log('Saved successfully:', data[0]?.id)
  return res.status(200).json({ id: data[0].id })
}
