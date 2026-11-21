# Leonida Ledger — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/yowanda/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/yowanda/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy is shown with its official name, description and grade, plus a step-by-step guide written in our own words that names its sources beside it. Your checklist saves in the browser, exports to a file, and imports back. No account, no network, no Rockstar artwork — the whole guide is static files you can host anywhere.

## What is inside

- **Tracker** — all 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with checkboxes that persist in localStorage. Search by name, mission or guide text; filter by kind (story, missable, collectibles, activities, crime, side quests, exploration, 100% completion, misc) and by grade; show earned-only. Every guide is open by default, with numbered steps and a `Sources:` line of links.
- **Roadmap to Platinum** — the 100% Completion checklist table now sits at the very top of the page, so every count is visible without scrolling. Below it, the new **Platinum path** panel lays out the run in order: Stage 1 story (60–80 hours), Stage 2 the 100% checklist (about 100 hours), Stage 3 Strangers & Freaks and cleanup (10–20 hours) — about 200 hours in one playthrough, no online play — with a "Next up" pointer and a live progress bar per story chapter.
- **Missables** — only one trophy is potentially missable (*Positive Mental Attitude*, the Chapter 1 balcony meditation), flagged on its card and on its own tab, with a save safety net (15 slots, no mission replay) and a **Save safety** panel: never save mid-timer in a timed mission (m7/m8), and always make a manual safehouse save before a boss mission. Eight trophies whose method is still unconfirmed say so honestly instead of guessing.
- **Spoiler mode** — hides the names and descriptions of un-earned story trophies until you earn them.
- **Offline by design** — `app/` is plain HTML, CSS and JavaScript with no build step and no network request at run time. The trophy data lives in `app/data/trophies.json`.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Any static file server works too: serve `app/` and open `app/index.html`.

## Hand it in (make.fun)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with the kit's vendored builder. It never clears the output directory itself — it only replaces the three entries it owns — so it is safe on a mounted `/output`.

## Sources

Official trophy names, descriptions and grades come from the official PlayStation 5 list as published on Exophase and PSNProfiles. Guide method and roadmap detail draw on PowerPyx, KeenGamer, Push Square, GameMapa and Vice City Hustle, cited per trophy in the app; where a method is unconfirmed, the guide says so. See the Sources section at the foot of the app for the full list.

## License

MIT — see `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=vpa00rt3&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
