# pstack model configuration

This project's sheet at `.agents/pstack-models.md`. Per-role model overrides for this repository; commit it so every runtime loads the same choices.

Skills-only install: there is no pstack SessionStart hook. Keep `session hook: off`. Agents must load role models from the harness section that matches the current runtime (`## cursor` or `## codex`). Flat lines above the sections are unused when a matching section exists.

Delete a line to fall back to the skill default. A value of `inherit-parent` or `auto` runs that role on the parent session's model (the dispatch omits `model`); an alias entry in a panel list still counts toward that panel's fan-out. A model may carry a reasoning effort after its slug (for example `gpt-6.2-astra @xhigh`); the role's subagent then runs at that level. `default effort` sets the level for a value without one; `session` uses the runtime's platform mapping to start from the parent session's effort.

default effort: session
session hook: off
panel vendors: any

## cursor

Use when running in Cursor (Task / subagent dispatch).

feature, refactoring: claude-sonnet-5-5-high
bug-fix: claude-opus-5-5-medium
perf-issue: claude-opus-5-5-medium
hillclimb: claude-opus-5-5-medium
judgment and prose: claude-opus-5-5-medium
strongest judgment: claude-fable-5-2-high
arena runners: claude-fable-5-2-high, claude-opus-5-5-medium, gemini-4-neon-high, composer-2.5-fast
arena cross-judge pool: claude-opus-5-5-medium, gemini-4-neon-high
swarm workers: composer-2.5-fast
interrogate reviewers: claude-fable-5-2-high, claude-opus-5-5-medium, gemini-4-neon-high, composer-2.5-fast
thermos reviewers: claude-opus-5-5-medium
no-comments reviewer: claude-opus-5-5-medium

## codex

Use when running in Codex. Slugs follow the OpenAI Codex catalog (GPT-6.2 Astra/Sol).

feature, refactoring: gpt-6.2-sol
bug-fix: gpt-6.2-astra
perf-issue: gpt-6.2-astra
hillclimb: gpt-6.2-astra
judgment and prose: gpt-6.2-sol
strongest judgment: gpt-6.2-astra
arena runners: gpt-6.2-astra, gpt-6.2-sol, gpt-6.1-terra, gpt-6-luna
arena cross-judge pool: gpt-6.2-astra, gpt-6.2-sol, gpt-6.1-terra
swarm workers: gpt-6.2-sol
interrogate reviewers: gpt-6.2-astra, gpt-6.2-sol, gpt-6.1-terra, gpt-6-luna
thermos reviewers: gpt-6.2-astra
no-comments reviewer: gpt-6.2-astra
