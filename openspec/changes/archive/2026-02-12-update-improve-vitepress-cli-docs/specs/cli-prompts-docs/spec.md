## ADDED Requirements

### Requirement: Prompts guide explains composing interactive flows

The documentation SHALL introduce `@tsed/cli-prompts`, describe the available prompt types (input, select, confirm, multi-step), and show how they integrate with Ts.ED DI.

#### Scenario: Prompt types enumerated

- **WHEN** a developer reads the overview section
- **THEN** it lists the built-in prompt components and their intended use cases

#### Scenario: DI integration documented

- **WHEN** the guide explains architecture
- **THEN** it shows how to inject prompt services via Ts.ED decorators or providers

### Requirement: Guide provides validation and branching examples

The prompts documentation SHALL include TypeScript snippets demonstrating synchronous/asynchronous validation, conditional branching, and chaining multiple prompts into a wizard-like flow.

#### Scenario: Validation sample provided

- **WHEN** a developer copies the validation example
- **THEN** it shows how to reject invalid input with a descriptive error message

#### Scenario: Branching sample provided

- **WHEN** the branching section is read
- **THEN** it demonstrates how to route to different prompts/tasks based on prior answers

### Requirement: Guide covers reuse and testing strategies

The documentation SHALL outline how to encapsulate prompts as reusable providers and how to unit-test them using the helpers from `cli-testing`.

#### Scenario: Reusable prompt provider described

- **WHEN** the developer follows the reuse section
- **THEN** the guide illustrates exporting prompts as classes/functions that can be shared across commands

#### Scenario: Testing section references cli-testing

- **WHEN** the testing guidance is read
- **THEN** it references `packages/cli-testing` utilities to stub prompt IO in unit tests
