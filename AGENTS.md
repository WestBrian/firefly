<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## pstack models

Per-role model overrides for pstack skills live in [`.agents/pstack-models.md`](.agents/pstack-models.md). Read that file before spawning role-model subagents (`arena`, `swarm`, `interrogate`, `thermos`, `no-comments`, and poteto-mode code/judgment roles). `/setup-pstack` writes and updates it.

This repo uses a skills-only pstack install (no SessionStart routing hook). The sheet has harness sections: use `## cursor` when running in Cursor, and `## codex` when running in Codex. Do not use the other section's slugs.