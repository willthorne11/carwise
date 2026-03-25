import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, email } = req.body

  if (!userId) return res.status(401).json({ error: 'Must be signed in to purchase' })

  try {
    // Create or retrieve Stripe customer
    let customerId
    const existing = await stripe.customers.list({ email, limit: 1 })
    if (existing.data.length > 0) {
      customerId = existing.data[0].id
    } else {
      const customer = await stripe.customers.create({ email, metadata: { supabase_user_id: userId } })
      customerId = customer.id
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 799,
      currency: 'gbp',
      customer: customerId,
      metadata: {
        supabase_user_id: userId,
        product: 'carwise_unlimited'
      },
      automatic_payment_methods: { enabled: true },
    })

    res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
