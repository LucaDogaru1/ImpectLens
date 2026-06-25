---
name: impactlens
description: >-
  Read the ticket, decide ticket_topic and change_includes, run analyze:ticket
  with inline --ticket text and --answers. Then ai-context or change-impact
  from the briefing. Graph.sqlite, blast radius, UI→API flows.
---

# ImpactLens

ImpactLens is a **code navigation tool**.

* Ticket = specification
* Graph = navigation
* Repository = source of truth

Always verify graph results in the repository before implementing.

---

# Workflow

## 1. Read the ticket and decide answers

Read the ticket text (from the user or issue). **You** choose:

* `ticket_topic` — primary workflow
* `change_includes` — main change surface
* `scopes` — `php` or `php,js`

**`ticket_topic`:** `ui` (CMS/layout/components) · `queue` (SQS/jobs/listeners) · `api` (endpoints/serialization) · `import` · `cron` · `migration` · `background` · `mixed`

**`change_includes`:** `cms_ui` · `queue_job` · `api_field` · `persistence` · `backend_logic` · `import_pipeline` · `infra_new` · `mixed`

**`scopes`:** `php` — backend/Blade/Livewire only · `php,js` — Vue/Nuxt/CMS UI or UI→API flows

---

## 2. Analyze

Pass the **ticket text** inline (not only a file path):

```bash
impactlens ticket sqlite/Graph.sqlite \
  --ticket="Hero teaser: full-width layout on homepage, slide preset dropdown" \
  --scopes=php,js \
  --answers=ticket_topic:ui,change_includes:cms_ui \
  --non-interactive
```

File paths still work when a ticket file exists: `--ticket=tickets/example.txt`

Use `--boost` or `--suppress` only if important ticket entities are buried by unrelated matches.

---

## 3. Investigate

Read the briefing in this order:

1. Read first
2. Flow paths
3. Warnings

Open the suggested files before broader repository search.

```bash
impactlens ai-context sqlite/Graph.sqlite "<symbol>" --compact
impactlens change-impact sqlite/Graph.sqlite "<symbol>"
```

Symbol ids (from briefing backticks): `SpOTTBackend\Services\Foo::bar` (PHP) · `js:apps/.../heroTeaser/index.vue::HeroTeaser` (Vue) · `api:GET:/slide-presets` (route)

---

## 4. Implement

Implement only after verifying the relevant code.

If the graph is incomplete or misleading, continue with normal repository investigation.

---

## 5. Feedback

Append one JSON line to `.ai/impactlens/impactlens-feedback.jsonl` when you can judge final usefulness. Once per ticket.

```json
{
  "timestamp": "2026-06-22T12:00:00Z",
  "ticket": "inline",
  "summary": "Hero teaser layout configuration",
  "ticket_topic": "ui",
  "change_includes": "cms_ui",
  "scopes": "php,js",
  "helpful": true,
  "reason": "helpful",
  "readFirst": ["js:apps/.../heroTeaser/index.vue::HeroTeaser"],
  "actual": ["js:apps/.../heroTeaser/index.vue::HeroTeaser"]
}
```

Failure reasons: `wrong-workflow` · `wrong-files` · `missing-files` · `wrong-flow-path` · `no-useful-results`

---

## Rules

* Read the ticket and pass explicit `--answers` with `--non-interactive`.
* Prefer inline `--ticket="…"` with the ticket text the user gave you.
* Do not treat the graph as the source of truth.
* Verify results in code before implementation.
* Record feedback when the briefing can be meaningfully evaluated.
