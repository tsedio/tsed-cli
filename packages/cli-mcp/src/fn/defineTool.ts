import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {RequestHandlerExtra} from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {CallToolResult, ServerNotification, ServerRequest, Tool} from "@modelcontextprotocol/sdk/types.js";
import {injectable} from "@tsed/cli-core";
import {isArrowFn} from "@tsed/core";
import {DIContext, injector, logger, runInContext, type TokenProvider} from "@tsed/di";
import {JsonSchema} from "@tsed/schema";
import {v4} from "uuid";

import {toZod} from "../utils/toZod.js";

export type ToolCallback<Args = undefined> = (
  args: Args,
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>
) => CallToolResult | Promise<CallToolResult>;
type ToolConfig = Parameters<McpServer["registerTool"]>[1];

export type ToolProps<Input, Output> = Omit<ToolConfig, "inputSchema" | "outputSchema"> & {
  token?: TokenProvider;
  name: string;
  inputSchema?: JsonSchema<Input> | (() => JsonSchema<Input>) | Tool["inputSchema"];
  outputSchema?: JsonSchema<Output> | Tool["outputSchema"];
  handler: ToolCallback<Input>;
};

/**
 * Tools let LLMs take actions through your server. Tools can perform computation, fetch data and have side effects.
 * Tools should be designed to be model-controlled - i.e. AI models will decide which tools to call, and the arguments.
 *
 * ```typescript
 * import {defineTool} from "@tsed/cli-mcp";
 * import {s} from "@tsed/schema";
 *
 * export default defineTool({
 *  name: "my-tool",
 *  title: "My Tool",
 *  description: "My tool description",
 *  inputSchema: s.object({
 *    param1: s.string().required() // also support Zod
 *  }),
 *  outputSchema: s.object({
 *     result: s.string().required() // also support Zod
 *  }),
 *  handler(args) {
 *    return {
 *      content: [],
 *      structuredContent: {
 *        result: "Hello World!"
 *      }
 *    }
 * });
 * ```
 *
 * @param options
 */
export function defineTool<Input, Output = undefined>(options: ToolProps<Input, Output>) {
  const provider = injectable(options.token || Symbol.for(`MCP:TOOL:${options.name}`))
    .type("CLI_MCP_TOOLS")
    .factory(() => ({
      ...options,
      inputSchema: toZod(isArrowFn(options.inputSchema) ? options.inputSchema() : options.inputSchema),
      outputSchema: toZod(options.outputSchema),
      async handler(args: Input, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) {
        const $ctx = new DIContext({
          id: v4(),
          injector: injector(),
          logger: logger(),
          level: logger().level,
          maxStackSize: 0,
          platform: "MCP"
        });

        try {
          return await runInContext($ctx, () => {
            return options.handler(args as Input, extra);
          });
        } catch (er) {
          $ctx.logger.error({
            event: "MCP_TOOL_ERROR",
            tool: options.name,
            error_message: er.message,
            stack: er.stack
          });

          return {
            content: [],
            structuredContent: {
              code: "E_MCP_TOOL_ERROR",
              message: er.message
            }
          };
        } finally {
          // Ensure per-invocation context is destroyed to avoid leaks
          try {
            await $ctx.destroy();
          } catch {
            // ignore
          }
        }
      }
    }));

  return provider.token();
}
