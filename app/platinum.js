// Leonida Ledger round 3 — Platinum path panel, per-chapter progress bars,
// and the roadmap-first reorder.
//
// Why this file exists: in round 2 the Roadmap view buried the 100%
// Completion checklist table at the bottom of Stage 2, below the fold, and
// the Roadmap had no at-a-glance summary of the whole platinum run. This
// module fixes both without touching the trophy data or the tracker code:
//  - it lifts the Stage 2 checklist table to the very top of the Roadmap
//    view, inside a compact panel, so every count is visible with no scroll;
//  - it builds a "Platinum path" panel from the live trophy data: the three
//    stages in order with their hour estimates, the next trophy to chase,
//    and one progress bar per story chapter plus the free-roam work.
// Everything here is computed at run time from data/trophies.json and the
// saved progress in localStorage, so the bars stay honest as trophies are
// ticked off, and the panel rebuilds itself whenever the list re-renders.

const GUIDE_DATA_URL = 'data/trophies.json';
const SAVED_PROGRESS_KEY = 'leonida-ledger-progress-v1';

const ROADMAP_VIEW_ID = 'view-roadmap';
const TRACKER_LIST_ID = 'list';

// Buckets in the order a player meets them. The `when` text on each trophy
// names its moment; the bucket is read off that text, never off a name, so
// a data edit that rewords a moment still lands in the right bucket.
const CHAPTER_BUCKETS = [
  { id: 'ch1', label: 'Chapter 1', hint: 'Opening to chapter complete' },
  { id: 'ch2', label: 'Chapter 2', hint: 'Both characters playable' },
  { id: 'ch3', label: 'Chapter 3', hint: 'Vice City opens up' },
  { id: 'ch4', label: 'Chapter 4', hint: 'Vault jobs begin' },
  { id: 'finale', label: 'Final mission', hint: 'Story ends, free roam opens' },
  { id: 'named', label: 'Named story missions', hint: 'Six missions, any chapter' },
  { id: 'after', label: 'After the story', hint: 'Strands, cleanup, 100%' },
  { id: 'roam', label: 'Free roam, any time', hint: 'Collectibles, combat, money' },
];

const STAGE_PLAN = [
  { stage: 'Stage 1', title: 'Story first', hours: '60–80 hours', what: 'All five chapters. Do the Chapter 1 balcony meditation before Chapter 1 ends.' },
  { stage: 'Stage 2', title: '100% Completion checklist', hours: 'about 100 hours', what: 'The table above is the whole grind — every count, nothing extra.' },
  { stage: 'Stage 3', title: 'Strangers & Freaks and cleanup', hours: '10–20 hours', what: 'Eight strands, last meditations, mop up combat, driving and money.' },
];

function chapterBucketId(whenText) {
  const when = (whenText ?? '').toLowerCase();
  if (when.includes('ch. 1') || when.startsWith('chapter 1')) return 'ch1';
  if (when.includes('after chapter 2') || when.startsWith('chapter 2')) return 'ch2';
  if (when.startsWith('chapter 3')) return 'ch3';
  if (when.startsWith('chapter 4')) return 'ch4';
  if (when.startsWith('final mission')) return 'finale';
  if (when.startsWith('story mission')) return 'named';
  if (when.startsWith('after the story') || when.startsWith('last') || when.startsWith('side strand')) return 'after';
  return 'roam';
}

function readSavedNames() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVED_PROGRESS_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((name) => typeof name === 'string') : []);
  } catch {
    return new Set();
  }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function buildStageCards() {
  const wrap = el('ol', 'platinum-stages');
  for (const plan of STAGE_PLAN) {
    const item = el('li', 'platinum-stage');
    const head = el('p', 'platinum-stage-head');
    head.append(el('strong', null, `${plan.stage} — ${plan.title} `));
    head.append(el('span', 'platinum-hours', plan.hours));
    item.append(head, el('p', 'platinum-stage-what', plan.what));
    wrap.append(item);
  }
  return wrap;
}

function buildChapterBars(trophies, earned) {
  const wrap = el('div', 'chapter-bars');
  for (const bucket of CHAPTER_BUCKETS) {
    const members = trophies.filter((t) => chapterBucketId(t.when) === bucket.id);
    if (members.length === 0) continue;
    const done = members.filter((t) => earned.has(t.name)).length;
    const pct = Math.round((done / members.length) * 100);
    const row = el('div', 'chapter-bar-row');
    row.title = `${bucket.label} — ${bucket.hint}`;
    const label = el('p', 'chapter-bar-label');
    label.append(el('strong', null, bucket.label + ' '));
    label.append(el('span', 'chapter-bar-count', `${done}/${members.length}`));
    const track = el('div', 'chapter-bar-track');
    const fill = el('div', 'chapter-bar-fill');
    fill.style.width = `${pct}%`;
    fill.title = `${bucket.label}: ${done} of ${members.length} earned (${pct}%)`;
    track.append(fill);
    row.append(label, track);
    wrap.append(row);
  }
  return wrap;
}

function firstUnearnedInOrder(trophies, earned) {
  const rank = new Map(CHAPTER_BUCKETS.map((bucket, i) => [bucket.id, i]));
  const ordered = [...trophies].sort(
    (a, b) => (rank.get(chapterBucketId(a.when)) ?? 99) - (rank.get(chapterBucketId(b.when)) ?? 99),
  );
  return ordered.find((t) => !earned.has(t.name)) ?? null;
}

function buildPlatinumPanel(trophies, earned) {
  const panel = el('section', 'platinum-path');
  panel.setAttribute('aria-label', 'Platinum path');
  panel.append(el('h2', 'platinum-title', 'Platinum path — the order that works'));
  const lede = el('p', 'platinum-lede');
  lede.append(
    el('strong', null, 'About 200 hours · one playthrough · no online play. '),
    document.createTextNode('Three stages, in order. Do them in this order and nothing is wasted: the story first, then the 100% checklist, then the strands and cleanup.'),
  );
  panel.append(lede);
  panel.append(buildStageCards());
  const next = firstUnearnedInOrder(trophies, earned);
  const nextLine = el('p', 'platinum-next');
  if (next) {
    nextLine.append(el('strong', null, 'Next up: '));
    nextLine.append(el('em', null, next.name));
    nextLine.append(document.createTextNode(` — ${next.when ?? 'any time'}.`));
  } else {
    nextLine.append(el('strong', null, 'All 55 earned — Vice Got a Price! is yours.'));
  }
  panel.append(nextLine);
  panel.append(el('h3', 'platinum-bars-title', 'Progress by chapter'));
  panel.append(buildChapterBars(trophies, earned));
  return panel;
}

function promoteChecklistTable() {
  const roadmap = document.getElementById(ROADMAP_VIEW_ID);
  if (!roadmap) return;
  const tables = roadmap.querySelectorAll('table.checklist-table');
  if (tables.length < 2) return;
  const stageTable = tables[1];
  const sourceNote = stageTable.nextElementSibling;
  const panel = el('section', 'checklist-first');
  panel.setAttribute('aria-label', '100 percent completion checklist');
  panel.append(el('h2', 'checklist-first-title', 'Stage 2 — the 100% Completion checklist'));
  panel.append(el(
    'p',
    'checklist-first-lede',
    'Every count the checklist asks for — the same table as Stage 2, lifted to the top.',
  ));
  panel.append(stageTable);
  if (sourceNote && sourceNote.classList.contains('source-line')) panel.append(sourceNote);
  roadmap.prepend(panel);
}

async function bootPlatinumPath() {
  const response = await fetch(GUIDE_DATA_URL);
  const doc = await response.json();
  const trophies = doc.trophies ?? [];
  const roadmap = document.getElementById(ROADMAP_VIEW_ID);
  if (!roadmap || trophies.length === 0) return;

  promoteChecklistTable();
  let panel = buildPlatinumPanel(trophies, readSavedNames());
  const checklistPanel = roadmap.querySelector('.checklist-first');
  if (checklistPanel) checklistPanel.after(panel);
  else roadmap.prepend(panel);

  // The tracker re-renders its list on every tick, so watch for that and
  // rebuild the bars and the next-up line from the fresh saved progress.
  const list = document.getElementById(TRACKER_LIST_ID);
  if (list) {
    const observer = new MutationObserver(() => {
      const fresh = buildPlatinumPanel(trophies, readSavedNames());
      panel.replaceWith(fresh);
      panel = fresh;
    });
    observer.observe(list, { childList: true, subtree: true, attributes: true });
  }
}

bootPlatinumPath();
