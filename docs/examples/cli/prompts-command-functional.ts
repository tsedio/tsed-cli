import {command} from "@tsed/cli-core";
import type {PromptQuestion} from "@tsed/cli-prompts";
import type {Task} from "@tsed/cli-tasks";

interface GeneratorAnswers {
  projectName: string;
  runtime: "node" | "bun";
  template: string;
  features: string[];
  installNow: boolean;
}

const runtimeChoices = [
  {name: "Node.js (LTS)", value: "node"},
  {name: "Bun", value: "bun", short: "Bun"}
];

function createPrompts(initial: Partial<GeneratorAnswers> = {}): PromptQuestion[] {
  return [
    {
      type: "input",
      name: "projectName",
      message: "Project name",
      default: initial.projectName || "awesome-cli",
      validate(value) {
        return /^[a-z0-9-]+$/i.test(value || "") ? true : "Project name may only contain letters, numbers, and dashes.";
      }
    },
    {
      type: "list",
      name: "runtime",
      message: "Select a runtime",
      choices: runtimeChoices,
      default: initial.runtime || "node"
    },
    {
      type: "autocomplete",
      name: "template",
      message: "Which starter template do you want to use?",
      source: async (_answers, keyword = "") => {
        const catalog = ["minimal", "fullstack", "plugin"];
        return catalog.filter((entry) => entry.includes(keyword)).map((value) => ({name: `${value} template`, value}));
      }
    },
    {
      type: "checkbox",
      name: "features",
      message: "Pick optional features",
      choices: [
        {name: "MCP server", value: "cli-mcp"},
        {name: "Interactive prompts", value: "cli-prompts", checked: true},
        {name: "Task runner", value: "cli-tasks"},
        {name: "Vitest", value: "vitest"},
        {name: "Swagger UI", value: "swagger"}
      ]
    },
    {
      type: "confirm",
      name: "installNow",
      message: "Install dependencies immediately?",
      default: initial.installNow ?? true,
      when: (answers) => answers.runtime === "node"
    }
  ];
}

function createTasks(): Task<GeneratorAnswers>[] {
  return [
    {
      title: "Generate files",
      task: async (_ctx, logger) => {
        logger.info("Writing project files...");
      }
    },
    {
      title: "Install dependencies",
      skip: (ctx) => (!ctx.installNow ? "Skipped by prompt" : false),
      task: async (_ctx, logger) => {
        logger.info("Installing dependencies...");
      }
    }
  ];
}

export const InteractiveInitCmd = command<GeneratorAnswers>({
  name: "init:interactive",
  description: "Guide developers through a multi-step scaffolding wizard",
  prompt(initial) {
    return createPrompts(initial);
  },
  handler() {
    return createTasks();
  }
}).token();
