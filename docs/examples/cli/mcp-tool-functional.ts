import {defineTool} from "@tsed/cli-mcp";
import {s} from "@tsed/schema";

interface HelloArgs {
  name: string;
}

export const helloTool = defineTool<HelloArgs>({
  name: "hello",
  description: "Greets callers from any MCP client",
  inputSchema: () =>
    s.object({
      name: s.string().description("Name to include in the greeting").prompt("Who should we greet?")
    }),
  outputSchema: () =>
    s.object({
      message: s.string().description("Structured greeting payload")
    }),
  async handler({name}) {
    return {
      content: [
        {
          type: "text",
          text: `Hello, ${name}!`
        }
      ],
      structuredContent: {
        message: `Hello, ${name}!`
      }
    };
  }
});
