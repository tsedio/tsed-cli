## ADDED Requirements

### Requirement: MCP init options metadata resource

The Ts.ED MCP server SHALL expose a resource (e.g., `tsed://init/options`) that returns the machine-readable init option schema so assistants can prompt humans before invoking `init-project`.

#### Scenario: Options metadata retrieval

- **WHEN** an MCP client reads `tsed://init/options`
- **THEN** the server responds with an `application/json` payload that includes every option from `InitSchema` (name, description, prompt text, defaults, CLI flag, enumerated choices, and nested feature groups) just like `tsed init-options`.

#### Scenario: Schema parity with CLI command

- **WHEN** `InitSchema` is updated (new option, renamed flag, etc.)
- **THEN** both the MCP resource and the `tsed init-options` command automatically reflect the change without maintaining duplicate JSON structures.

### Requirement: init-project tool nudges assistants to gather options

The `init-project` MCP tool MUST reuse the same `InitSchema` metadata and explicitly direct assistants to fetch options before executing.

#### Scenario: Tool metadata references option discovery

- **WHEN** a client inspects the `init-project` tool (list or describe)
- **THEN** the tool description explains that callers should load `tsed://init/options`, ask the human for desired values, and pass them along with `cwd`.

#### Scenario: Schema alignment across tool and resource

- **WHEN** validation occurs for `init-project` inputs
- **THEN** the tool's `inputSchema` is derived from the same source as the metadata resource so new init flags are instantly recognized and validated.
