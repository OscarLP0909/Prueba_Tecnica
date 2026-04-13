export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { tasks, context } = req.body

    if (!tasks || !Array.isArray(tasks) || tasks.length < 2) {
        return res.status(400).json({ error: 'Se necesitan al menos 2 tareas' })
    }

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

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        })

        const data = await response.json()
        const text = data.choices[0].message.content
        const clean = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)

        return res.status(200).json(parsed)
    } catch {
        return res.status(500).json({ error: 'Error al procesar las tareas' })
    }
}