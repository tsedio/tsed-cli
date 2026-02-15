import {defineTool} from "@tsed/cli-mcp";
import {inject} from "@tsed/di";
import {s} from "@tsed/schema";

import {CliTemplatesService} from "../../../services/CliTemplatesService.js";
import {resolveSchema} from "../../../utils/resolveSchema.js";

export const getTemplateTool = defineTool({
  name: "get-template",
  title: "Get template",
  description: "Return full information for a template including its JSON schema (if provided).",
  inputSchema: s.object({
    id: s.string().required().description("Template id (e.g., 'controller', 'service')")
  }),
  outputSchema: s.object({
    id: s.string().description("Template id"),
    label: s.string().description("Template label"),
    description: s.string().optional().description("Template description"),
    schema: s
      .object()
      .optional()
      .description("Additional properties to provide to generate-file tool for this template (beyond the global 'id' and 'name' fields)")
  }),
  async handler(args) {
    const {id} = args as any;
    const templates = inject(CliTemplatesService);
    const tpl = templates.get(id);

    if (!tpl) {
      return {
        content: [],
        isError: true,
        structuredContent: {
          code: "E_TEMPLATE_UNKNOWN",
          message: `Unknown template id '${id}'.`,
          suggestion: "Use 'list-templates' to discover available template types."
        }
      };
    }

    return {
      content: [],
      structuredContent: {
        id: tpl.id,
        label: tpl.label,
        description: tpl.description,
        schema: await resolveSchema(tpl.schema)
      }
    };
  }
});
