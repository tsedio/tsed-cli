import type {PromptQuestion} from "@tsed/cli-prompts";

export interface GeneratorAnswers {
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

export function createGeneratorPrompts(initial: Partial<GeneratorAnswers> = {}): PromptQuestion[] {
  return [
    {
      type: "input",
      name: "projectName",
      message: "Project name",
      default: initial.projectName || "awesome-cli",
      validate(value) {
        return /^[a-z0-9-]+$/i.test(value || "") ? undefined : "Project name may only contain letters, numbers, and dashes.";
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
      when: (answers) => answers.runtime === "node" // Bun users often prefer manual install
    }
  ];
}
