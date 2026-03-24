import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, type, input, result } = req.body

  if (!userId || !type || !result) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { data, error } = await supabase
    .from('searches')
    .insert([{
      user_id: userId,
      type,
      input: JSON.stringify(input),
      result: JSON.stringify(result),
      created_at: new Date().toISOString()
    }])
    .select()

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ id: data[0].id })
}
