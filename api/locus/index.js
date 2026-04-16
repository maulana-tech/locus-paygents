const LOCUS_BASE = 'https://beta-api.paywithlocus.com';

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const path = request.query.path;
  if (!path) {
    return response.status(400).json({ error: 'Missing ?path= parameter' });
  }

  const apiKey = process.env.VITE_LOCUS_API_KEY || '';
  const url = `${LOCUS_BASE}${path}`;

  const fetchOpts = {
    method: request.method || 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };

  if (request.method === 'POST' && request.body) {
    fetchOpts.body = JSON.stringify(request.body);
  }

  try {
    const res = await fetch(url, fetchOpts);
    const data = await res.text();

    response.setHeader('Cache-Control', 's-maxage=2');
    response.status(res.status).setHeader('Content-Type', 'application/json');
    response.send(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Proxy error';
    response.status(502).json({ success: false, error: msg });
  }
}
