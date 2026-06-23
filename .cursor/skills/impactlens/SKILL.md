---
name: impactlens
description: >-
  Run ImpactLens ticket analysis with inferred --answers (never unsure on readable
  tickets), optional --boost/--suppress, then ai-context or change-impact from
  the briefing. Use for tickets, blast radius, UI→API flows, Graph.sqlite, or
  impactlens CLI.
---

# ImpactLens — agent playbook

> **Never use `unsure` on readable tickets.** Always pass `--answers=ticket_topic:…,change_includes:…`. Skipping intent ranks the wrong workflow (e.g. queue jobs on a CMS/UI ticket).

ImpactLens returns a **compact markdown briefing** from a pre-built graph. **Ticket = spec; graph = navigation.**

1. Read ticket → infer intent
2. `impactlens ticket` with `--answers` (+ `--boost`/`--suppress` if noisy)
3. Open **read-first** files (max 3–5)
4. `ai-context` / `change-impact` on one symbol — before grep or manual tracing

Assume `sqlite/Graph.sqlite` exists. **Do not re-scan** unless the graph is missing or the user asks.

**CLI:** `impactlens …` or `npx impactlens …` · list commands: `npx impactlens --commands`  
Use `npm run analyze:*` only inside the ImpactLens source repo.

If graph and ticket disagree: **trust the ticket** → use graph to locate code → verify manually.

---

## Run ticket analysis

```bash
impactlens ticket sqlite/Graph.sqlite \
  --ticket=tickets/example.txt \
  --scopes=php,js \
  --answers=ticket_topic:<id>,change_includes:<id> \
  --boost=SlidePresetDropdown,slidePreset \
  --suppress=vertical-promotion
```

Default output is the **briefing** (token-efficient). Use `--full` only when debugging ranking.

### Ranking hints (`--boost` / `--suppress`)

Optional comma-separated symbol/path terms from the ticket.

| Flag | Effect |
|------|--------|
| `--boost=HeroTeaser,slidePreset` | Raise nodes matching those terms |
| `--suppress=vertical-promotion` | Demote or drop noisy matches |

Use when the ticket names a concrete entity but ranking surfaces neighbors (e.g. `vertical-promotion` drowning `heroTeaser`). **Hints nudge scores only — they do not create graph edges.** Briefing **read-first** may still lead with route/symbol anchors; use `--full` or `--legacy` to inspect ranked evidence.

### Scopes (`--scopes`)

| Scope | Use when |
|-------|----------|
| `php` | Controllers, services, jobs, listeners, imports, migrations, API resources, Blade/Livewire with little JS |
| `php,js` | Vue, Nuxt, CMS UI, composables, frontend logic, UI→API flows |

**Examples:** SQS/job/import/API Resource-only → `php` · Hero Vue layout, slide preset dropdown, CMS module, Nuxt composables/`$fetch` → `php,js`

**`php,js` when ticket mentions:** `.vue`, components, composables, CMS/editor UI, client filters, frontend API calls.  
**`php` when only:** PHP classes, routes, jobs, migrations, Blade, Livewire, models, serializers.

Nuxt monorepos need `impactlens.config.json` package aliases — see package `docs/support.md` and `docs/config-setup.md`.

### Infer `--answers`

**`ticket_topic`**

| id | Mainly about |
|----|----------------|
| `ui` | CMS/admin UI, layouts, components, display rules, hero/preset/slide |
| `queue` | SQS, listeners, async jobs, consumers |
| `api` | Endpoints, request/response, serialization |
| `import` | XML/CSV/feed ingestion |
| `cron` | Scheduled jobs |
| `migration` | Schema/columns/tables |
| `background` | Background workers (non-SQS) |
| `mixed` | Two+ workflows equally |

**`change_includes`**

| id | Touches |
|----|---------|
| `cms_ui` | CMS/editor/admin UI (most layout specs) |
| `queue_job` | Listener, SQS consumer, job class |
| `api_field` | API payload/response fields |
| `persistence` | DB/model columns/status |
| `backend_logic` | Services only |
| `import_pipeline` | Import/parser pipeline |
| `infra_new` | Net-new infra |
| `mixed` | Multiple surfaces equally |

**Mappings:** hero CMS spec → `ui,cms_ui` · SQS archive → `queue,queue_job` · slide preset UI + API filter → `ui,mixed`

Always set explicit `--answers` yourself from the ticket text. Use `--non-interactive` only for automation or scripting (skips prompts when answers are already complete).

---

## Use the briefing

Order: **Read first** → **Likely flow paths** → **Files to open** → **Warnings / verify** → ticket acceptance criteria.

- `[complete]` = UI→HTTP→controller chain in graph
- `[partial]` = graph gap — **do not invent** missing code
- Ignore flow paths that do not match ticket entities
- **Implementation confidence &lt; 0.35** → navigation hints only

---

## Follow-up (before manual repo search)

Symbol ids from briefing backticks:

- PHP: `SpOTTBackend\\Services\\Foo::bar`
- Vue/JS: `js:apps/.../heroTeaser/index.vue::HeroTeaser`
- API: `api:GET:/slide-presets`

```bash
impactlens ai-context sqlite/Graph.sqlite "<symbol>" --compact    # callers, callees, deps
impactlens change-impact sqlite/Graph.sqlite "<symbol>" --depth=2 --limit=10   # blast radius
impactlens impact sqlite/Graph.sqlite "<symbol>" --limit=20        # deeper + inheritance
```

| Command | When |
|---------|------|
| `architecture --architecture-config=…` | Layer-rule checks |
| `risk` / `hotspots` | Repo-wide risk, no specific ticket target |
| `cycles` / `dead-code` | Cleanup tasks, not feature tickets |

**Sequence:** ticket → read-first → pick symbol → `ai-context` → `change-impact` (if editing) → implement

---

## Do not

- `unsure` or omit `--answers` on readable tickets
- Paste `Graph.json` or `--full` output into chat
- Re-scan every ticket
- Treat unrelated `[complete]` paths as in-scope
- Grep callers when `ai-context` / `change-impact` can answer

## Known graph gaps (state honestly)

- Partial flows: missing `HTTP_REQUEST` (path aliases, scan gap, undetected `$fetch`/`useFetch`)
- Nuxt: Nitro `server/api/` not scanned; `$fetch`/`useFetch` need `api/v…` in source
- Pug templates not parsed; `vendor/`, `node_modules/`, `tests/` excluded
- PHP scanner mature; JS/Vue/Nuxt beta — read `docs/support.md`

## Human setup

`impactlens scan /path/to/repo --lang=both --output=both` · aliases: `docs/config-setup.md` · `docs/quickstart.md`
