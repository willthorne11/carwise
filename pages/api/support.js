export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, subject, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Carwise Support <noreply@carwise.site>',
        to: ['help@carwise.site'],
        reply_to: email,
        subject: `[Carwise Support] ${subject || 'New message'} — from ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #000;">New support message</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666; width: 100px;">Name</td><td style="padding: 8px 0;"><strong>${name}</strong></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Subject</td><td style="padding: 8px 0;">${subject || 'Not specified'}</td></tr>
            </table>
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid #eee;" />
            <h3 style="color: #000;">Message</h3>
            <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
        `
      })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || 'Failed to send email')
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Support email error:', err)
    return res.status(500).json({ error: err.message })
  }
}
