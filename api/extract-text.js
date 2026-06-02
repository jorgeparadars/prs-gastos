
export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const { texto } = await req.json();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'Eres un extractor de datos de gastos para una empresa constructora en México. El usuario describe un gasto en lenguaje natural. Extrae la información y responde SOLO con un objeto JSON válido sin markdown, sin backticks, sin texto adicional. Campos: monto (número), proveedor (string), concepto (string), categoria (una de: Materiales, Mano de obra, Herramienta, Mantenimiento, Transporte, Viáticos, Otros), fecha (YYYY-MM-DD usa hoy si no se menciona), metodo_pago (Efectivo si no se menciona). Si no encuentras algún campo usa null.',
        messages: [{ role: 'user', content: texto }]
      })
    });
    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '{}';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
export const config = { runtime: 'edge' };
