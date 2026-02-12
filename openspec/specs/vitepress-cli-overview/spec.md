# vitepress-cli-overview Specification

## Purpose

Document the requirements for the VitePress CLI overview page so navigation, architecture notes, and quickstart instructions stay consistent with the Ts.ED CLI experience.

## Requirements

### Requirement: CLI overview page is discoverable

The documentation SHALL expose a dedicated `/guide/cli/overview` page that is reachable from both the home page feature cards and the sidebar navigation under a “CLI” section.

#### Scenario: Navigation entry is visible

- **WHEN** a developer opens the VitePress site sidebar
- **THEN** they see a “CLI” group with a link to the Overview page

#### Scenario: Home page highlights CLI overview

- **WHEN** a developer visits `docs/index.md`
- **THEN** a hero action or feature card links directly to `/guide/cli/overview`

### Requirement: Overview page explains architecture and compatibility

The overview page SHALL describe how `@tsed/cli`, `@tsed/cli-mcp`, `@tsed/cli-prompts`, and `@tsed/cli-tasks` collaborate, list supported Node.js/Ts.ED versions, and call out prerequisites for using the interactive runtime.

#### Scenario: Architecture section present

- **WHEN** a developer scans the overview page
- **THEN** they find a section that diagrams or enumerates how CLI core, MCP, prompts, and tasks communicate

#### Scenario: Compatibility matrix present

- **WHEN** a developer needs to validate runtime support
- **THEN** the page shows the minimum `@tsed/cli` version plus required Node.js release for the interactive features

### Requirement: Overview provides a quickstart walkthrough

The documentation SHALL include a quickstart that installs `@tsed/cli`, scaffolds a project, and demonstrates enabling interactive prompts/tasks with copyable commands and TypeScript snippets.

#### Scenario: Installation commands documented

- **WHEN** a developer follows the quickstart
- **THEN** they can copy npm/yarn commands to install `@tsed/cli` globally or locally

#### Scenario: Interactive flow snippet available

- **WHEN** the developer reads the quickstart code sample
- **THEN** it shows a minimal example of registering a prompt and task to demonstrate the interactive runtime
