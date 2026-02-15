import {definePrompt} from "@tsed/cli-mcp";
import {s} from "@tsed/schema";

interface PlanArgs {
  name: string;
  runtime: "node" | "bun";
}

export const planPrompt = definePrompt<PlanArgs>({
  name: "generate-plan",
  title: "Generation plan",
  description: "Summarize how the CLI will scaffold files.",
  argsSchema: () =>
    s.object({
      name: s.string().description("Project codename"),
      runtime: s.enums<PlanArgs["runtime"]>(["node", "bun"]).description("Runtime selected by the developer")
    }),
  handler({name, runtime}) {
    return {
      description: `Outline the steps to scaffold ${name} for ${runtime}.`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Project "${name}" targets the ${runtime} runtime. Produce a checklist of generation steps.`
          }
        }
      ]
    };
  }
});
