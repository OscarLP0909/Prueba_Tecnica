const API_KEY = import.meta.env.VITE_GROQ_API_KEY

export async function prioritizeTasks(tasks, context) {
  const prompt = `Eres un asistente de productividad. El usuario tiene estas tareas para hoy:

${tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}

${context ? `Contexto adicional: ${context}` : ''}

Devuelve SOLO un JSON válido con este formato exacto, sin texto adicional ni backticks:
{
  "tasks": [
    {
      "title": "nombre de la tarea",
      "reason": "explicación de por qué tiene esta prioridad (1-2 frases)"
    }
  ]
}

Ordena las tareas de mayor a menor prioridad. Ten en cuenta urgencia, impacto, dependencias y el contexto del usuario.`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  })

  const data = await res.json()
  const text = data.choices[0].message.content
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}