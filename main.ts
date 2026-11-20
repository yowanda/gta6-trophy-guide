// Leonida Ledger — entry program for make.fun gta6-trophy-guide-01 (Node 22, stdlib only).
//
// The guide itself is plain static files under app/ (index.html, app.js, style.css
// and app/data/trophies.json) that a browser opens offline. This program hands it in:
// it copies app/ and screenshots/ from this repository into the output directory
// and writes /output/dossier.json with the vendored make.fun library, so the judge
// reads the screenshots and the source outline. Run it locally with:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The grader runs it with /output as the destination instead.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps from the competition's sealed gate: at most 4 screenshots of 256 KiB each,
// app/ at most 993 files and 48 MiB, and the dossier text at most 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
