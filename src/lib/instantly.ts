const INSTANTLY_API = 'https://api.instantly.ai/api/v2'

export async function instantlyGet(endpoint: string) {
  const resp = await fetch(`${INSTANTLY_API}${endpoint}`, {
    headers: { Authorization: `Bearer ${process.env.INSTANTLY_API_KEY}` },
  })
  return resp.json()
}

export async function instantlyPost(endpoint: string, body: Record<string, unknown>) {
  const resp = await fetch(`${INSTANTLY_API}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return resp.json()
}
