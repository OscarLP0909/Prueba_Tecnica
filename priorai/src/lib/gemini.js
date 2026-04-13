export async function prioritizeTasks(tasks, context) {
  const res = await fetch('/api/prioritize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks, context })
  })

  if (!res.ok) throw new Error('Error en la API')

  return await res.json()
}