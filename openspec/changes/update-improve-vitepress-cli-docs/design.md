## Context

Ts.ED’s VitePress site (`docs/`) currently highlights the CLI only in passing (hero CTA plus a short getting-started article). The latest CLI release added interactive building blocks—`@tsed/cli-mcp`, `@tsed/cli-prompts`, and `@tsed/cli-tasks`—yet developers have to read scattered READMEs under `packages/` to understand them. There is no dedicated navigation entry, topical overview, or walkthrough that explains how these packages compose into an interactive CLI. The audience is Ts.ED-powered tool authors who already know TypeScript and expect runnable snippets, version requirements, and guidance for extending the CLI safely. We must organize the docs so that VitePress acts as the canonical reference for the CLI experience introduced in this release.

## Goals / Non-Goals

**Goals:**

- Provide a CLI-focused information architecture (landing page plus sub-guides) that is discoverable from the VitePress sidebar and home page.
- Author capability-driven guides (`vitepress-cli-overview`, `cli-mcp-docs`, `cli-prompts-docs`, `cli-tasks-docs`) with TypeScript examples, install commands, and extension advice.
- Reuse authoritative code samples from `packages/cli*` (either by inlining or importing snippets) to reduce divergence between docs and implementation.
- Call out runtime compatibility (Node.js version, Ts.ED minimum version, dependency relationships) and explain how the packages interact when building interactive flows.

**Non-Goals:**

- Rewriting existing Ts.ED framework documentation or changing the CLI API surface.
- Automating full API reference generation for the CLI packages (manual curated guides suffice for this change).
- Creating a hosted playground or live terminal demos; static docs with code snippets are adequate for now.

## Decisions

1. **Dedicated CLI section in VitePress navigation**  
   Update `docs/.vitepress/config.ts` to add a top-level “CLI” group that links to four new pages: overview, MCP, prompts, and tasks. The landing page (`docs/index.md`) will also gain a feature card highlighting the interactive CLI runtime and linking to `/guide/cli/overview`. This reduces the number of clicks required to discover CLI content and aligns with how other Ts.ED capabilities (e.g., GraphQL, serverless) are exposed.

2. **Capability-driven page structure mapped to packages**  
   Each capability defined in the proposal becomes `docs/guide/cli/<capability>.md`. Pages share a consistent outline: concept summary, installation, quickstart snippet, deep-dive (e.g., building a task pipeline), and integration points. Examples showcase TypeScript usage of `@tsed/cli-mcp`, `@tsed/cli-prompts`, and `@tsed/cli-tasks`, referencing the same imports exposed by the packages. This mirrors the spec-driven artifacts and makes it obvious how features map to npm dependencies.

3. **Snippet sourcing strategy**  
   Rather than copying fragments from READMEs manually, we will either (a) extract canonical examples into shared `.ts` files under `docs/examples/cli/` or (b) reference the package README sections via Markdown `<!-- @include -->` comments (supported by VitePress). The initial change will stage examples in `docs/examples/cli/` so they can be type-checked by `tsc --noEmit` in CI. This ensures future CLI API changes trigger doc updates because snippets fail to compile.

4. **Experience-driven callouts and task/prompt walkthroughs**  
   The prompts and tasks guides will walk through building an interactive generator: define prompts, stream progress with `CliTasks`, and expose the workflow via the MCP server. We will rely on VitePress custom containers (`::: tip`, `::: warning`) to highlight behavioral constraints (e.g., MCP requires Node.js 20+). This decision keeps the documentation practitioner-focused instead of being a raw API dump.

## Risks / Trade-offs

- **Doc drift from source packages** → Mitigate by sourcing examples from shared `.ts` files referenced by both docs and READMEs, and adding a CI check that runs the snippet build.
- **Navigation clutter** → Adding another top-level nav entry may crowd the sidebar, but grouping all CLI topics under a single parent keeps it manageable.
- **Version skew** → Developers on older CLI versions might copy examples that rely on the new packages. We will add version badges and note the minimum `@tsed/cli` version required at the top of each page.
- **Increased build size** → More images/snippets marginally slow down `yarn docs:build`. Keep media light (mostly plaintext) and reuse existing assets when possible.

## Migration Plan

1. Create `docs/guide/cli/` (if missing) and add the four capability markdown files using the agreed outline and shared snippet imports.
2. Update `docs/.vitepress/config.ts` and `docs/index.md` to surface the CLI section (nav links, feature card) plus any necessary sidebar ordering.
3. Add `docs/examples/cli/` TypeScript snippets referenced by both docs and package READMEs; wire a lightweight `yarn docs:check-cli-snippets` script (tsc invocation) into CI if practical.
4. Run `yarn docs:serve` to verify navigation, syntax highlighting, and link integrity, then capture screenshots/logs for the PR description.
5. Communicate the doc updates in release notes so package consumers know where to find the richer CLI guidance.

## Open Questions

- Should we backport the new CLI docs into the main tsed.dev site or leave them exclusive to the CLI VitePress instance?
- Do we need language-localized versions (FR/JA) or is English-only sufficient for this release?
- Would embedding terminal recordings (as GIFs) materially aid comprehension, or can we defer multimedia assets to a later iteration?
