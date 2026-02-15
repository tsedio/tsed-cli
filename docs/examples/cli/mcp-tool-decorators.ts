import {Tool} from "@tsed/cli-mcp";
import {Injectable} from "@tsed/di";
import {Description, Property, Returns} from "@tsed/schema";

class HelloInput {
  @Property()
  name: string;
}

class HelloOutput {
  @Property()
  message: string;
}

@Injectable()
export class HelloTool {
  @Tool("hello")
  @Description("Greets callers from any MCP client")
  @Returns(200, HelloOutput)
  async handle(input: HelloInput) {
    return {
      content: [
        {
          type: "text",
          text: `Hello, ${input.name}!`
        }
      ],
      structuredContent: {
        message: `Hello, ${input.name}!`
      }
    };
  }
}
