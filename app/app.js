// Leonida Ledger — GTA VI trophy tracker. Plain ES module, no dependencies.
// Loads app/data/trophies.json (a file of this app, nothing over the network),
// keeps earned trophies in localStorage, and renders the tracker, roadmap
// and missables views from that one data file.

const STORE_KEY = 'leonida-ledger-progress-v1';
const SPOILER_KEY = 'leonida-ledger-spoiler-v1';

const listEl = document.getElementById('list');
const missableListEl = document.getElementById('missable-list');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const earnedOnlyEl = document.getElementById('earned-only');
const filterNoteEl = document.getElementById('filter-note');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set(loadEarned());
spoilerEl.checked = localStorage.getItem(SPOILER_KEY) === '1';

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
}

function gradeLabel(grade) {
  return grade === 'platinum' ? 'P' : grade === 'gold' ? 'G' : grade === 'silver' ? 'S' : 'B';
}

function kindLabel(kind) {
  const labels = {
    story: 'Story', side: 'Side quest', collectibles: 'Collectibles',
    activities: 'Activities', crime: 'Crime', exploration: 'Exploration',
    completion: '100% completion', misc: 'Miscellaneous', platinum: 'Platinum',
  };
  return labels[kind] ?? kind;
}

function isSpoilerHidden(trophy) {
  return spoilerEl.checked && trophy.kind === 'story' && !earned.has(trophy.name);
}

function sourceLink(name) {
  const entry = (doc.guide_sources ?? []).find((s) => s.name === name)
    ?? (doc.list_sources ?? []).find((s) => s.name === name);
  if (!entry) return name;
  const a = document.createElement('a');
  a.href = entry.url;
  a.textContent = name;
  a.target = '_blank';
  a.rel = 'noopener';
  return a;
}

function renderTrophy(trophy) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(trophy.name) ? ' earned' : '');
  li.dataset.name = trophy.name;

  const head = document.createElement('div');
  head.className = 'trophy-head';

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveEarned();
    renderAll();
  });
  head.append(box);

  const medal = document.createElement('span');
  medal.className = `medal ${trophy.grade}`;
  medal.textContent = gradeLabel(trophy.grade);
  medal.title = trophy.grade;
  head.append(medal);

  const main = document.createElement('div');
  main.className = 'trophy-main';

  const hidden = isSpoilerHidden(trophy);
  const nameEl = document.createElement('p');
  nameEl.className = 'trophy-name';
  if (hidden) {
    const span = document.createElement('span');
    span.className = 'hidden-name';
    span.textContent = 'Hidden story trophy — earn it to reveal';
    nameEl.append(span);
  } else {
    nameEl.textContent = trophy.name;
  }
  main.append(nameEl);

  const descEl = document.createElement('p');
  descEl.className = 'trophy-desc';
  descEl.textContent = hidden ? 'Story trophy. Its name and description are hidden while spoilers are on.' : trophy.description;
  main.append(descEl);

  const badges = document.createElement('div');
  badges.className = 'badges';
  const gradeBadge = document.createElement('span');
  gradeBadge.className = 'badge';
  gradeBadge.textContent = trophy.grade;
  badges.append(gradeBadge);
  if (trophy.kind !== 'platinum') {
    const kindBadge = document.createElement('span');
    kindBadge.className = 'badge' + (trophy.kind === 'story' ? ' story' : '');
    kindBadge.textContent = kindLabel(trophy.kind);
    badges.append(kindBadge);
  }
  if (trophy.missable) {
    const miss = document.createElement('span');
    miss.className = 'badge missable';
    miss.textContent = 'Potentially missable';
    badges.append(miss);
  }
  if (trophy.target != null) {
    const target = document.createElement('span');
    target.className = 'badge target';
    target.textContent = `Target: ${trophy.target.toLocaleString('en-US')}`;
    badges.append(target);
  }
  main.append(badges);

  if (!hidden) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    toggle.textContent = 'Show guide ▸';
    const guide = document.createElement('div');
    guide.className = 'guide';
    guide.hidden = true;
    const guideText = document.createElement('p');
    guideText.textContent = trophy.guide;
    guide.append(guideText);
    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.append('Sources: ');
    (trophy.sources ?? []).forEach((name, i) => {
      if (i > 0) sources.append(' · ');
      sources.append(sourceLink(name));
    });
    guide.append(sources);
    toggle.addEventListener('click', () => {
      guide.hidden = !guide.hidden;
      toggle.textContent = guide.hidden ? 'Show guide ▸' : 'Hide guide ▾';
    });
    main.append(toggle, guide);
  }

  head.append(main);
  li.append(head);
  return li;
}

function visibleTrophies() {
  const query = searchEl.value.trim().toLowerCase();
  const kind = kindEl.value;
  const grade = gradeEl.value;
  return trophies.filter((t) => {
    if (kind === 'missable' ? !t.missable : kind !== 'all' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (earnedOnlyEl.checked && !earned.has(t.name)) return false;
    if (query && !(t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))) return false;
    return true;
  });
}

function renderProgress() {
  const count = earned.size;
  const pct = Math.round((count / trophies.length) * 100);
  document.getElementById('earned-count').textContent = String(count);
  document.getElementById('progress-text').textContent = `${pct}% to the platinum — ${count} of ${trophies.length} earned`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  const byGrade = {};
  for (const t of trophies) if (earned.has(t.name)) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  document.getElementById('grade-counts').textContent =
    `Platinum ${byGrade.platinum ?? 0}/1 · Gold ${byGrade.gold ?? 0}/2 · Silver ${byGrade.silver ?? 0}/6 · Bronze ${byGrade.bronze ?? 0}/46`;
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren(...shown.map(renderTrophy));
  filterNoteEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies` +
    (spoilerEl.checked ? ' · spoiler mode on: un-earned story trophies are hidden' : '');
}

function renderMissables() {
  const missable = trophies.filter((t) => t.missable);
  missableListEl.replaceChildren(...missable.map(renderTrophy));
}

function renderAll() {
  renderProgress();
  renderList();
  renderMissables();
}

function showView(name) {
  for (const view of ['tracker', 'roadmap', 'missables']) {
    document.getElementById(`view-${view}`).classList.toggle('hidden', view !== name);
    document.getElementById(`tab-${view}`).classList.toggle('active', view === name);
  }
}

document.getElementById('tab-tracker').addEventListener('click', () => showView('tracker'));
document.getElementById('tab-roadmap').addEventListener('click', () => showView('roadmap'));
document.getElementById('tab-missables').addEventListener('click', () => showView('missables'));

for (const el of [searchEl, kindEl, gradeEl, earnedOnlyEl]) {
  el.addEventListener('input', renderList);
  el.addEventListener('change', renderList);
}
spoilerEl.addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, spoilerEl.checked ? '1' : '0');
  renderAll();
});

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set((names ?? []).filter((n) => known.has(n)));
    saveEarned();
    renderAll();
  } catch {
    alert('That file is not a Leonida Ledger progress export.');
  }
  event.target.value = '';
});

renderAll();
