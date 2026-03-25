import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { buffer } from 'micro'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Use service role key so webhook can write to DB without auth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    const userId = paymentIntent.metadata?.supabase_user_id

    if (userId) {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_unlimited: true,
          paid_at: new Date().toISOString(),
          stripe_customer_id: paymentIntent.customer
        })
        .eq('id', userId)

      if (error) {
        console.error('Failed to unlock user:', error)
        return res.status(500).json({ error: 'Failed to update profile' })
      }

      console.log(`Unlocked user ${userId}`)
    }
  }

  res.status(200).json({ received: true })
}
