import {command} from "@tsed/cli-core";
import {definePrompt, defineResource, defineTool, MCP_SERVER} from "@tsed/cli-mcp";
import {inject} from "@tsed/di";
import {s} from "@tsed/schema";
import {z} from "zod";

interface HelloToolInput {
  name: string;
}

interface HelloToolOutput {
  message: string;
}

export const helloTool = defineTool<HelloToolInput, HelloToolOutput>({
  name: "hello",
  inputSchema: () =>
    s.object({
      name: s.string().required().description("Name to greet")
    }),
  outputSchema: () =>
    s.object({
      message: s.string().description("Greeting message")
    }),
  async handler({name}) {
    return {
      content: [],
      structuredContent: {message: `Hello, ${name}!`}
    };
  }
});

export const changelogResource = defineResource({
  name: "changelog",
  uri: "changelog://latest",
  title: "Latest changes",
  description: "Returns the latest CLI release notes",
  mimeType: "text/plain",
  async handler() {
    return {
      contents: [
        {
          uri: "changelog://latest",
          text: "- feat: interactive CLI docs available at https://cli.tsed.dev/guide/cli/overview"
        }
      ]
    };
  }
});

export const planPrompt = definePrompt({
  name: "generate-plan",
  title: "Generation plan",
  description: "Summarize how the CLI will scaffold files",
  argsSchema: {
    name: z.string().min(1),
    runtime: z.enum(["node", "bun"])
  },
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

export const ServeMcpCommand = command({
  name: "dev:mcp",
  description: "Expose CLI tools through the Model Context Protocol",
  inputSchema: s
    .object({
      http: s.boolean().default(false).description("Use the HTTP transport instead of stdio").opt("--http")
    })
    .description("MCP command options"),
  handler(options) {
    const server = inject(MCP_SERVER);
    return server.connect(options.http ? "streamable-http" : "stdio");
  }
}).token();
