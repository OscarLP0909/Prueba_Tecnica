# PriorAI — Daily task prioritizer

Escribe tus tareas del día y la IA las ordena por prioridad con una justificación para cada una.

## Demo



## Stack

- React + Vite
- Groq API (llama-3.1-8b-instant)

## Ejecutar localmente

1. Clona el repo
2. Instala dependencias: `npm install`
3. Crea un fichero `.env` en la raíz: VITE_GROQ_API_KEY=tu_api_key_aquí
Consigue una key gratuita en [console.groq.com](https://console.groq.com)
4. Arranca: `npm run dev`
5. Abre `http://localhost:5173`

## Prompt log

### Prompt 1 — Diseño del sistema prompt
> "Devuelve SOLO un JSON válido con este formato exacto, sin texto adicional..."

Funcionó porque al pedir JSON estructurado y añadir "sin texto adicional" evité que el modelo añadiera explicaciones antes o después del JSON, lo que rompía el `JSON.parse()`.

### Prompt 2 — Criterios de priorización
> "Ten en cuenta urgencia, impacto, dependencias y el contexto del usuario"

Añadir estos criterios explícitos mejoró mucho la calidad de las justificaciones. Sin ellos, el modelo priorizaba solo por urgencia y las razones eran genéricas.

### Prompt 3 — Campo de contexto
> "Contexto adicional: tengo reunión a las 5, estoy con poca energía"

Este campo fue el cambio más importante del proyecto. Al principio el prompt no lo incluía y la priorización era muy genérica. Al añadir contexto personal, las justificaciones se volvieron específicas y útiles de verdad.