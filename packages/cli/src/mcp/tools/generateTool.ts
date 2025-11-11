import {ProjectPackageJson, validate} from "@tsed/cli-core";
import {defineTool} from "@tsed/cli-mcp";
import {inject} from "@tsed/di";
import {array, number, object, string} from "@tsed/schema";

import {CliProjectService} from "../../services/CliProjectService.js";
import {CliTemplatesService} from "../../services/CliTemplatesService.js";
import {mapDefaultTemplateOptions} from "../../services/mappers/mapDefaultTemplateOptions.js";

export const generateTool = defineTool({
  name: "generate-file",
  title: "Generate file",
  description: "Generate a new Ts.ED provider class depending on the given parameters.",
  inputSchema: object({
    id: string().required().description("The id of the file to generate (e.g., 'model', 'controller', 'service')."),
    name: string().required().description("The name of the class to generate.")
  }),
  outputSchema: object({
    files: array().items(string()).description("List of generated files."),
    count: number().description("Number of files generated."),
    symbolPath: string().optional().description("Main generated symbol path"),
    logs: array().items(string()).optional().description("Execution logs"),
    warnings: array().items(string()).optional().description("Non blocking warnings")
  }),
  async handler(args) {
    const projectService = inject(CliProjectService);
    const templates = inject(CliTemplatesService);
    const projectPackage = inject(ProjectPackageJson);

    // Pre-checks
    const warnings: string[] = [];

    if (!projectPackage.cwd) {
      return {
        content: [],
        isError: true,
        structuredContent: {
          code: "E_CWD_NOT_SET",
          message: "Workspace is not set. Call set-workspace first to define the project root.",
          suggestion: "Call 'set-workspace' with the project directory, then retry 'generate-file'."
        }
      };
    }

    if (!projectPackage.preferences?.packageManager) {
      return {
        content: [],
        isError: true,
        structuredContent: {
          code: "E_PROJECT_NOT_INITIALIZED",
          message: "The target directory does not appear to be an initialized Ts.ED project.",
          suggestion:
            "Run 'init-project' to initialize a Ts.ED project in this workspace before generating files, or use 'set-workspace' to configure the tool to point to the appropriate working directory."
        }
      };
    }

    const ctx = mapDefaultTemplateOptions({...args, type: args.id});

    const {type} = ctx;

    // Validate template exists
    const template = inject(CliTemplatesService).get(type);

    if (!template) {
      return {
        content: [],
        isError: true,
        structuredContent: {
          code: "E_TEMPLATE_UNKNOWN",
          message: `Unknown template type '${type}'.`,
          suggestion: "Use 'list-templates' to discover available template types."
        }
      };
    }

    // validate the schema of the resolved template
    if (template.schema) {
      const {id, name, ...additionalProps} = args;
      const {isValid, errors} = validate(additionalProps, template.schema);

      if (!isValid) {
        return {
          content: [],
          isError: true,
          structuredContent: {
            code: "E_ARGS_INVALID",
            message: `Invalid arguments for template '${type}'.`,
            suggestion: "Call 'get-template' to inspect required fields and formats, then retry.",
            details: {errors}
          }
        };
      }
    }

    await projectService.createFromTemplate(type, ctx as any);
    await projectService.transformFiles(ctx as any);

    const rendered = templates.getRenderedFiles();
    const files = rendered.map((f) => f.outputPath);
    const count = files.length;
    const symbolPath = ctx.symbolPath || rendered[0]?.symbolPath || rendered[0]?.outputPath;

    const logs = [`createFromTemplate:${type}`, `transformFiles:done`, `files:${count}`];

    return {
      content: [],
      structuredContent: {
        files,
        count,
        symbolPath,
        logs,
        warnings: warnings.length ? warnings : undefined
      }
    };
  }
});
