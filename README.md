# ImpactLens

⚠️ Before using ImpactLens, read:
docs/support.md

It explains what PHP, JavaScript, Vue and Nuxt support actually covers,
known limitations, and the maturity of each scanner.

---

ImpactLens scans a codebase into a queryable graph and maps ticket text
to relevant code.

Ticket → Graph → Briefing

It helps you answer:

- Where should I start reading code?
- Which files are relevant to this ticket?
- What breaks if I change this?
- How does a UI action reach backend code?

---

## Install

```bash
npm install impactlens
```

On install, the agent skill is written to `.ai/impactlens/skill.md`. Skip with `IMPACTLENS_SKIP_SKILL=1`. Re-run: `npx impactlens install-skill`.

```bash
npx impactlens --commands
npx impactlens --help
```

---

## Quick Start

# Scan repository
impactlens scan /path/to/repo --lang=both

# Analyze ticket
impactlens ticket sqlite/Graph.sqlite \
  --ticket=tickets/issue.txt \
  --scopes=php,js

---

## What it builds

- PHP classes, methods, routes
- Vue components
- JS/TS modules
- Imports and calls
- HTTP links (frontend → backend when resolvable)

---

## Main Commands

| Command | Purpose |
|----------|----------|
| scan | Build graph |
| ticket | Ticket → briefing |
| ai-context | Analyze one symbol |
| change-impact | Blast radius |
| architecture | Layer violations |
| cycles | Circular dependencies |

---

## Documentation

- docs/support.md ← Read first
- docs/quickstart.md
- docs/config-setup.md
- docs/commands.md
- docs/graph-model.md
- assets/agent-skill/SKILL.md — agent playbook (→ `.ai/impactlens/skill.md` on install)

---

## License

ISC