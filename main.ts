// SPDX-License-Identifier: MIT
// Leonida Ledger round 3 — entrypoint for gta6-trophy-guide-01.
//
// What this program does, in one paragraph: it takes the finished guide
// that lives beside this file (the static app/ folder and the screenshots/
// folder) and hands both to the grader in a fresh output directory. It
// writes /output/dossier.json with the kit's vendored builder, so the judge
// can read the screenshots and a short outline of the source. It runs on
// Node 22 with the standard library only; nothing is installed first.
//
// Two deliberate choices in this round's rewrite:
//  - The output directory is never wiped. The grader mounts /output, and
//    deleting a mounted directory fails, so this program only creates the
//    folders it needs and overwrites the files it owns. Stale files from an
//    older run are removed one by one, by name, never by clearing a tree.
//  - Every copy is explicit and ordered. app/ goes first, then the
//    screenshots, then the dossier is built last from what is already on
//    disk, so the dossier always describes exactly the bytes handed in.
//    Running the program twice over the same tree writes the same bytes.
//
// Outside the grader, set MAKEFUN_OUTPUT_DIR to a scratch folder:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const REPO_ROOT = fileURLToPath(new URL('.', import.meta.url));
const OUTPUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
const APP_DIR = join(REPO_ROOT, 'app');
const SHOTS_DIR = join(REPO_ROOT, 'screenshots');

const DOSSIER_TEXT_CAP = 163840;
const SHOTS_CAP = 4;
const SHOT_MAX_BYTES = 262144;
const APP_MAX_ENTRIES = 993;
const APP_MAX_BYTES = 50331648;

function fail(message: string): never {
  throw new Error(`[leonida-ledger] ${message}`);
}

function mustBeDirectory(path: string, label: string): void {
  if (!existsSync(path) || !statSync(path).isDirectory()) fail(`missing ${label} directory: ${path}`);
}

function freshChildDirectory(parent: string, name: string): string {
  const child = join(parent, name);
  mkdirSync(child, { recursive: true });
  return child;
}

function dropStaleOutputs(outDir: string): void {
  // Remove only the three things this program owns, file by file. The
  // output directory itself is left standing, mount point and all.
  for (const name of ['app', 'screenshots', 'dossier.json']) {
    const target = join(outDir, name);
    if (existsSync(target)) rmSync(target, { recursive: true, force: true });
  }
}

function copyGuideInto(outDir: string): void {
  mustBeDirectory(APP_DIR, 'app');
  cpSync(APP_DIR, join(outDir, 'app'), { recursive: true });
  if (existsSync(SHOTS_DIR) && statSync(SHOTS_DIR).isDirectory()) {
    cpSync(SHOTS_DIR, join(outDir, 'screenshots'), { recursive: true });
  } else {
    freshChildDirectory(outDir, 'screenshots');
  }
}

function checkShots(outDir: string): void {
  const shots = join(outDir, 'screenshots');
  const names = readdirSync(shots)
    .filter((name) => !name.startsWith('.'))
    .sort();
  if (names.length < 3 || names.length > SHOTS_CAP) {
    fail(`expected 3 or 4 screenshots, found ${names.length}`);
  }
  for (const name of names) {
    const size = statSync(join(shots, name)).size;
    if (size > SHOT_MAX_BYTES) fail(`screenshot ${name} is ${size} bytes, over the 256 KiB cap`);
  }
}

function writeDossier(outDir: string): void {
  const dossier = buildDossier(outDir, {
    text_max_bytes: DOSSIER_TEXT_CAP,
    screenshots: { max: SHOTS_CAP, max_bytes: SHOT_MAX_BYTES },
    app_max_files: APP_MAX_ENTRIES,
    app_max_bytes: APP_MAX_BYTES,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

function handInGuide(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  dropStaleOutputs(OUTPUT_DIR);
  copyGuideInto(OUTPUT_DIR);
  checkShots(OUTPUT_DIR);
  writeDossier(OUTPUT_DIR);
}

handInGuide();
