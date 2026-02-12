## ADDED Requirements

### Requirement: MCP docs describe installation and setup

The CLI MCP guide SHALL document how to add `@tsed/cli-mcp` to an existing CLI project, list peer dependencies, and note the minimum Node.js version for MCP support.

#### Scenario: Installation commands provided

- **WHEN** a developer reads the “Install” section
- **THEN** they see npm/pnpm/yarn commands that add `@tsed/cli-mcp` and required peers

#### Scenario: Runtime prerequisites listed

- **WHEN** the developer needs compatibility information
- **THEN** the guide specifies supported Node.js/Ts.ED versions for MCP servers

### Requirement: Guide shows how to expose MCP servers

The documentation SHALL provide a complete TypeScript example that extends `CliMcpServer`, registers tools/endpoints, and wires the server into the CLI bootstrap process.

#### Scenario: TypeScript sample compiles

- **WHEN** a developer copies the example into `src/index.ts`
- **THEN** it includes imports, class definition, and registration code without placeholders

#### Scenario: Workflow registration explained

- **WHEN** the guide describes wiring
- **THEN** it explains how to register the MCP server with `CliCore` so external clients can connect

### Requirement: Guide covers security and transport configuration

The MCP docs SHALL explain available transports (stdio, HTTP, Unix socket) and outline security considerations such as authentication or sandboxing for exposed tools.

#### Scenario: Transport options enumerated

- **WHEN** a developer evaluates deployment models
- **THEN** the guide lists the supported transports and how to select each one

#### Scenario: Security callouts present

- **WHEN** the developer reads the security section
- **THEN** it highlights how to restrict commands, sanitize inputs, or sandbox MCP tool execution
