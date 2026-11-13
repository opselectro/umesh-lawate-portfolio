// Vercel serverless function. API key stays server-side.
import { config, profile } from './_data'
const hits = new Map<string, number[]>()
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end()
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(501).json({ error: 'AI not configured (demo mode).' })
  const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0], now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => now - t < 60000)
  if (recent.length >= 10) return res.status(429).json({ error: 'Rate limit' })
  hits.set(ip, [...recent, now])
  const msgs = Array.isArray(req.body?.messages) ? req.body.messages.slice(-8) : []
  const clean = msgs.filter((m: any) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').map((m: any) => ({ role: m.role, content: m.content.slice(0, 500) }))
  if (!clean.length || clean[clean.length - 1].role !== 'user') return res.status(400).json({ error: 'Invalid input' })
  const system = `You are UMESH AI, the portfolio assistant for ${config.name}. Answer ONLY using the profile data below, in 1-4 short sentences. If the answer is not in the data, say you don't have that information and suggest emailing ${config.email}. Refuse unrelated requests politely. Never invent metrics, projects or skills.\nPROFILE:\n${profile}`
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5', max_tokens: 400, system, messages: clean }) })
    if (!r.ok) return res.status(502).json({ error: 'Upstream error' })
    const d = await r.json()
    res.status(200).json({ reply: d.content?.[0]?.text || "I don't have that information." })
  } catch { res.status(502).json({ error: 'Upstream error' }) }
}
