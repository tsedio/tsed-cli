## 1. Information Architecture & Navigation

- [x] 1.1 Add a “CLI” group with overview/MCP/prompts/tasks entries to `docs/.vitepress/config.ts` sidebar + navbar configuration.
- [x] 1.2 Update `docs/index.md` hero/feature cards to link directly to `/guide/cli/overview` and highlight the interactive CLI runtime.
- [x] 1.3 Create `docs/guide/cli/` directory (if missing) and ensure VitePress frontmatter titles match sidebar labels.

## 2. Content Authoring

- [x] 2.1 Write `docs/guide/cli/overview.md` covering architecture, compatibility matrix, and quickstart commands/snippets per the specs.
- [x] 2.2 Draft `docs/guide/cli/mcp.md` with installation instructions, MCP server examples, transport/security sections.
- [x] 2.3 Draft `docs/guide/cli/prompts.md` documenting prompt types, validation/branching examples, and reuse/testing guidance.
- [x] 2.4 Draft `docs/guide/cli/tasks.md` explaining orchestration concepts, progress/streaming samples, and error/cancellation patterns.

## 3. Example Snippets & Validation

- [x] 3.1 Extract canonical TypeScript snippets into `docs/examples/cli/` (overview quickstart, MCP server, prompt flow, task orchestration) and ensure they import real package APIs.
- [x] 3.2 Reference the shared snippets from both docs and relevant package READMEs (or inline them) so examples stay in sync.
- [x] 3.3 Add a lint/test script (e.g., `yarn docs:check-cli-snippets`) that runs `tsc --noEmit` against the examples, wiring it into CI if practical.

## 4. Verification & Launch

- [x] 4.1 Run `yarn docs:serve` (or `docs:build`) to verify navigation, syntax highlighting, and link integrity for the new CLI pages.
- [x] 4.2 Capture screenshots or logs demonstrating the updated CLI docs for inclusion in the PR/release notes.
- [x] 4.3 Update CHANGELOG or release notes to mention the enhanced CLI documentation and link to the new pages.
