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
    type: string().required().description("The type of the file to generate (e.g., 'model', 'controller', 'service')."),
    name: string().required().description("The name of the class to generate."),

    // options
    route: string().description("The route for the controller generated file."),
    directory: string().description("Directory where the file must be generated."),
    templateType: string().description("The template type to use for generation."),
    middlewarePosition: string().description("Middleware position (before, after).")
  }),
  outputSchema: object({
    files: array().items(string()).description("List of generated files."),
    count: number().description("Number of files generated.")
  }),
  async handler(args) {
    const projectService = inject(CliProjectService);
    const templates = inject(CliTemplatesService);

    const ctx = mapDefaultTemplateOptions(args);
    const {symbolPath, type} = ctx;

    // const output = {bmi: weightKg / (heightM * heightM)};
    await projectService.createFromTemplate(type, ctx);
    await projectService.transformFiles(ctx);

    const files = templates.renderedFiles;

    // TODO map rendered files to content response
    return {
      content: [
        // {
        //   type: "text",
        //   text: JSON.stringify(output)
        // }
      ],
      structuredContent: {}
    };
  }
});
