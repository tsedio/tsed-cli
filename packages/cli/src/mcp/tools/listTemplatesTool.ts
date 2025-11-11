import {defineTool} from "@tsed/cli-mcp";
import {inject} from "@tsed/di";
import {array, object, string} from "@tsed/schema";

import {CliTemplatesService} from "../../services/CliTemplatesService.js";

export const listTemplatesTool = defineTool({
  name: "list-templates",
  title: "List templates",
  description: "List available Ts.ED templates for generation. Optionally filter by type substring.",
  inputSchema: object({
    type: string().description("Filter by template id/label substring (case-insensitive).")
  }),
  outputSchema: object({
    items: array().items(
      object({
        id: string(),
        type: string(),
        label: string().optional(),
        description: string().optional()
      })
    )
  }),
  async handler(args) {
    const {type} = (args as any) || {};
    const templates = inject(CliTemplatesService);
    const items = templates.find(type).map((tpl) => ({
      id: tpl.id,
      type: tpl.id,
      label: tpl.label,
      description: (tpl as any).description
    }));

    return {
      content: [],
      structuredContent: {
        items
      }
    };
  }
});
