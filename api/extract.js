export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const { image, mediaType } = await req.json();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: 'Extrae datos de un ticket de compra mexicano. Responde SOLO JSON sin markdown ni backticks. Campos: monto (número), proveedor (string), concepto (string), categoria (Materiales/Mano de obra/Herramienta/Mantenimiento/Transporte/Viáticos/Otros), fecha (YYYY-MM-DD), metodo_pago (Efectivo/Transferencia/Tarjeta). Usa null si no encuentras el campo.',
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
          { type: 'text', text: 'Extrae los datos.' }
        ]}]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(JSON.stringify(data.error));
    const text = data.content?.find(b => b.type === 'text')?.text || '{}';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export const config = { runtime: 'edge' };
