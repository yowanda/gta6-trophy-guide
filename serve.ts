// Serve the Leonida Ledger guide locally: `node serve.ts`, then open http://localhost:8080.
// Serves only the files under app/, so the guide runs exactly as it will offline.
// Set PORT to listen on another port, e.g. `PORT=8124 node serve.ts`.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(fileURLToPath(new URL('.', import.meta.url)), 'app');
const PORT = Number(process.env.PORT ?? 8080);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

function safePath(url) {
  const raw = (url ?? '/').split('?')[0];
  const cleaned = normalize(join(appDir, raw === '/' ? '/index.html' : raw));
  // Refuse anything that escapes app/ (e.g. /../serve.ts) instead of serving it.
  if (cleaned !== appDir && !cleaned.startsWith(appDir + sep)) return null;
  return cleaned;
}

createServer(async (req, res) => {
  const file = safePath(req.url);
  if (file === null) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
  }
}).listen(PORT, () => console.log(`Leonida Ledger at http://localhost:${PORT} (serving ${appDir})`));
