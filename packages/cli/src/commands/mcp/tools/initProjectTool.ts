import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {defineTool} from "@tsed/cli-mcp";
import {context, inject} from "@tsed/di";
import {s} from "@tsed/schema";

import {CliTemplatesService} from "../../../services/CliTemplatesService.js";
import {InitMCPSchema} from "../schema/InitMCPSchema.js";

export const initProjectTool = defineTool({
  name: "init-project",
  title: "Initialize Ts.ED project",
  description: "Initialize a new Ts.ED project in the current workspace (sans Listr/logs).",
  inputSchema: InitMCPSchema,
  outputSchema: s.object({
    files: s.array().items(s.string()).description("List of generated files."),
    count: s.number().description("Number of files generated."),
    projectName: s.string().optional().description("Resolved project name."),
    cwd: s.string().optional().description("Resolved workspace directory in which the project was initialized."),
    logs: s.array().items(s.string()).optional().description("Execution logs"),
    warnings: s.array().items(s.string()).optional().description("Non blocking warnings")
  }),
  async handler(input) {
    const cliService = inject(CliService);
    const projectPackage = inject(ProjectPackageJson);
    const templates = inject(CliTemplatesService);

    projectPackage.setCWD(input.cwd);

    // If the current workspace already looks initialized, block to prevent accidental re-init
    if (projectPackage.preferences?.packageManager) {
      return {
        content: [],
        isError: true,
        structuredContent: {
          code: "E_PROJECT_ALREADY_INITIALIZED",
          message: "This workspace already appears to be an initialized Ts.ED project.",
          suggestion: "Use 'generate-file' to add new files, or call 'set-workspace' with a different folder to initialize a new project."
        }
      };
    }

    const warnings: string[] = [];

    // Build options and map context (skip prompts by default)
    const initialOptions = {
      skipPrompt: true,
      ...(input as any)
    } as any;

    cliService.load();

    await cliService.exec("init", initialOptions, context());

    // Collect rendered files from templates service (same pattern as generateTool)
    const rendered = templates.getRenderedFiles();
    const files = rendered.map((f) => f.outputPath);

    const logs = [
      `init:root:${projectPackage.cwd ?? "."}`,
      `init:platform:${projectPackage.preferences.platform}`,
      `files:${files.length}`
    ];

    return {
      content: [],
      structuredContent: {
        files,
        count: files.length,
        projectName: projectPackage.name,
        cwd: projectPackage.cwd,
        logs,
        warnings: warnings.length ? warnings : undefined
      }
    };
  }
});
