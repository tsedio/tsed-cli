import {defineTool} from "@tsed/cli-mcp";
import {inject} from "@tsed/di";
import {array, object, string} from "@tsed/schema";

import {CliTemplatesService} from "../../../services/CliTemplatesService.js";
import {summarizeSchema} from "../../../utils/summarizeSchema.js";

export const listTemplatesTool = defineTool({
  name: "list-templates",
  title: "List templates",
  description: "List available Ts.ED templates for generation (tsed generate). Optionally filter by type substring.",
  inputSchema: object({
    search: string().description("Filter by template id/label substring (case-insensitive).")
  }),
  outputSchema: object({
    items: array().items(
      object({
        id: string(),
        label: string().optional(),
        description: string().optional(),
        required: array().items(string()).optional(),
        properties: object().optional()
      })
    )
  }),
  async handler(args) {
    const {search} = args || {};
    const templates = inject(CliTemplatesService);

    return {
      content: [],
      structuredContent: {
        items: templates.find(search).map((tpl) => ({
          id: tpl.id,
          label: tpl.label,
          description: tpl.description,
          ...summarizeSchema(tpl)
        }))
      }
    };
  }
});
