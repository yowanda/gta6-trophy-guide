// Serve the Leonida Ledger guide locally: `node serve.ts`, then open http://localhost:8080.
// Serves only the files under app/, so the guide runs exactly as it will offline.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(fileURLToPath(new URL('.', import.meta.url)), 'app');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

createServer(async (req, res) => {
  const path = req.url === '/' ? '/index.html' : (req.url ?? '/').split('?')[0];
  try {
    const data = await readFile(join(appDir, path));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(8080, () => console.log('Leonida Ledger at http://localhost:8080'));
