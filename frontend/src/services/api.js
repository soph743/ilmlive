// Calls the Flask JSON API. In development Vite forwards /api to Flask (vite.config.js).
//
// Resolves with the parsed JSON body; throws an Error whose message is safe to show.
export async function api(method, path, body) {
  let response
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Can’t reach the server. Check your connection and try again.')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (data.error) throw new Error(data.error)
    throw new Error(
      response.status >= 500
        ? 'The server isn’t responding. Is the backend running?'
        : 'Something went wrong. Please try again.',
    )
  }
  return data
}
