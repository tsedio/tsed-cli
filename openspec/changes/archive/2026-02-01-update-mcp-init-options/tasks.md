## 1. Implementation

- [ ] 1.1 Extract a shared helper (or reuse `InitSchema`) that returns the serialized init options JSON so both CLI and MCP reuse the same source of truth.
- [ ] 1.2 Add an MCP resource (e.g., `tsed://init/options`) that returns this JSON, register it, and ensure errors are surfaced when the schema cannot be built.
- [ ] 1.3 Update `InitOptionsCmd` and `initProjectTool`/`InitMCPSchema` to reference the helper, document the "fetch options → ask user → init" flow, and adjust tool descriptions/logging accordingly.
- [ ] 1.4 Add or update automated coverage (unit/integration) showing the resource outputs the schema and `init-project` rejects missing cwd/invalid options; validate via `yarn test` or targeted suites.
