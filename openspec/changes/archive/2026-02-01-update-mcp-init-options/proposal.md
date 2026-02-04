# Change: Improve MCP init option discovery

## Why

MCP clients currently call the `init-project` tool with hard-coded defaults because they have no machine-readable source for all Ts.ED init settings. That makes the LLM skip important questions (platform, features, runtimes) and produces projects that do not match the human's intent.

## What Changes

- Add an MCP resource that mirrors `tsed init-options` so assistants can inspect every init flag, default, and choice before invoking `init-project`.
- Update the `init-project` tool metadata/schema to reference this resource and stay in lockstep with `InitSchema`, nudging assistants to gather user input first.
- Document the improved prompting flow so MCP consumers understand they should fetch options, ask the human, then call `init-project` with the chosen values.

## Impact

- Affected specs: `mcp-init-metadata`
- Affected code: `packages/cli/src/commands/mcp/resources/*`, `packages/cli/src/commands/mcp/tools/initProjectTool.ts`, `packages/cli/src/commands/mcp/schema/InitMCPSchema.ts`, `packages/cli/src/commands/init/InitOptionsCmd.ts`
