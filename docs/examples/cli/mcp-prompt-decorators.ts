import {Prompt} from "@tsed/cli-mcp";
import {Injectable} from "@tsed/di";
import {Description, s} from "@tsed/schema";

@Injectable()
export class PlanPrompt {
  @Prompt({
    name: "generate-plan",
    title: "Generation plan",
    description: "Summarize how the CLI will scaffold files.",
    argsSchema: () =>
      s.object({
        name: s.string().description("Project codename"),
        runtime: s.enums(["node", "bun"] as const).description("Runtime selected by the developer")
      })
  })
  @Description("Outline the scaffolding steps for the selected runtime.")
  handle({name, runtime}: {name: string; runtime: "node" | "bun"}) {
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
}
