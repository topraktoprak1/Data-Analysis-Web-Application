const fs = require('fs');

// Use the global fetch implementation available in Node 18+
const fetch = global.fetch || (async () => { throw new Error('No global fetch available'); })();

(async () => {
  try {
    const apiBase = process.env.VITE_API_URL || 'http://localhost:5000';
    console.log('Syncing data from', apiBase);

    const loginRes = await fetch(`${apiBase}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      redirect: 'manual'
    });

    const cookies = loginRes.headers.raw()['set-cookie'] || [];
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

    if (!loginRes.ok) {
      console.warn('Login failed:', loginRes.status, await loginRes.text());
    } else {
      console.log('Login succeeded');
    }

    const recordsRes = await fetch(`${apiBase}/api/get-records?page=1&per_page=10000`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': cookieHeader
      }
    });

    if (!recordsRes.ok) {
      console.warn('Failed to fetch records:', recordsRes.status, await recordsRes.text());
      process.exit(0);
    }

    const recordsJson = await recordsRes.json();

    const records = recordsJson.records || [];
    const out = {};
    for (const r of records) {
      const id = r.id || r.ID || r.Id || String(Math.random()).slice(2);
      out[id] = r;
    }

    const outPath = './public/data.json';
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
    console.log(`Wrote ${Object.keys(out).length} records to ${outPath}`);
  } catch (err) {
    console.error('Sync error', err);
  }
})();
