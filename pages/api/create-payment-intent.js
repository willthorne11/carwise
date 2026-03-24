import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 799,
      currency: 'gbp',
      metadata: { product: 'carwise_unlimited' },
      automatic_payment_methods: { enabled: true },
    })

    res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
