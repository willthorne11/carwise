import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { type, data } = req.body

  try {
    if (type === 'review') {
      const { make, model, year, mileage, price, fuel, concerns } = data

      const prompt = `You are Carwise, a no-nonsense UK car buying advisor. A user wants a review of this car:

Make: ${make || 'Unknown'}
Model: ${model || 'Unknown'}
Year: ${year || 'Unknown'}
Mileage: ${mileage ? mileage + ' miles' : 'Unknown'}
Asking price: ${price ? '£' + price : 'Unknown'}
Fuel type: ${fuel || 'Unknown'}
User concerns: ${concerns || 'None mentioned'}

Return a JSON object with exactly this structure:
{
  "verdict": "fair" | "overpriced" | "great_deal",
  "verdict_label": "Fair price" | "Overpriced" | "Great deal",
  "verdict_text": "One punchy sentence verdict — direct, honest, no fluff",
  "overall_score": 0-10,
  "reliability_score": 0-10,
  "value_score": 0-10,
  "running_costs_score": 0-10,
  "insurance_score": 0-10,
  "suggested_offer": number (suggested offer price in pounds),
  "offer_reason": "One sentence on why they can negotiate to this price",
  "flags": [
    { "type": "good" | "warn" | "bad", "text": "short flag text" }
  ],
  "positives": "2-3 sentences on what is genuinely good about this car",
  "watch_out": "2-3 sentences on what to check or be careful about",
  "alternatives": [
    {
      "name": "Make Model (Year)",
      "why": "One line on why it is better or comparable",
      "price": "~£XXXX"
    }
  ],
  "insurance_groups": {
    "17_21": "£X,XXX–£X,XXX",
    "22_25": "£XXX–£X,XXX",
    "26_35": "£XXX–£XXX",
    "35_plus": "£XXX–£XXX"
  },
  "insurance_group_number": number,
  "road_tax_annual": number,
  "road_tax_6month": number,
  "depreciation_2yr": number,
  "depreciation_4yr": number,
  "depreciation_note": "One sentence on depreciation for this model",
  "owner_rating": number (out of 5),
  "owner_review_count": number,
  "owner_reliability": number (out of 5),
  "owner_running_costs": number (out of 5),
  "owner_comfort": number (out of 5),
  "owner_practicality": number (out of 5),
  "owner_reviews": [
    {
      "tenure": "Owner since YEAR · XX,XXX miles",
      "stars": 1-5,
      "text": "Realistic owner quote in quotes"
    }
  ],
  "checklist_specific": [
    { "text": "Check item specific to this exact make/model", "warn": "optional warning text or null" }
  ]
}

Be honest. If the car is unreliable, say so. If the price is too high, say so. Use UK pricing and UK context throughout. Return only valid JSON, no markdown.`

      const message = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })

      const text = message.content[0].text
      const clean = text.replace(/```json|```/g, '').trim()
      const result = JSON.parse(clean)
      return res.status(200).json(result)
    }

    if (type === 'shortlist') {
      const { minBudget, maxBudget, uses, priorities, postcode, fuel, transmission, size } = data

      const prompt = `You are Carwise, a no-nonsense UK car buying advisor. A user wants a shortlist of used cars.

STRICT BUDGET: £${minBudget} to £${maxBudget}. This is non-negotiable. EVERY car you recommend MUST be commonly available in the UK used car market within this exact price range right now. Do NOT recommend cars that are typically priced above £${maxBudget}. If the budget is low (under £5,000) recommend older, high-mileage but reliable cars that genuinely sell in this range.

How they use the car: ${uses.join(', ')}
Their priorities: ${priorities.join(', ')}
Location: ${postcode || 'UK'}
Fuel preference: ${fuel || 'no preference'}
Transmission: ${transmission || 'no preference'}
Number of cars wanted: ${size}

Return a JSON array of exactly ${size} cars. Each car must be genuinely available within the £${minBudget}–£${maxBudget} budget in the UK used market. Format:
[
  {
    "rank": 1,
    "make": "Toyota",
    "model": "Yaris",
    "years": "2010–2014",
    "typical_price": "£${minBudget}–£${maxBudget}",
    "price_midpoint": ${Math.round((minBudget + maxBudget) / 2)},
    "reason": "2-3 sentences — why this car fits this budget and this person's priorities. Be specific about why it works at this price point.",
    "tags_good": ["tag1", "tag2"],
    "tags_warn": ["optional warning"],
    "overall_score": 8.5,
    "reliability_score": 9.0,
    "running_costs_score": 8.5
  }
]

CRITICAL: The typical_price field must show prices within the user's budget range of £${minBudget}–£${maxBudget}. The years field must reflect what you'd realistically find at this price — for low budgets this means older cars with higher mileage. Be honest about the age and condition of cars in this price bracket.

Return only valid JSON array, no markdown.`

      const message = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      })

      const text = message.content[0].text
      const clean = text.replace(/```json|```/g, '').trim()
      const result = JSON.parse(clean)
      return res.status(200).json(result)
    }

    return res.status(400).json({ error: 'Invalid type' })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Analysis failed', details: err.message })
  }
}
