import type {McpServer, PromptCallback} from "@modelcontextprotocol/sdk/server/mcp.js";
import {injectable} from "@tsed/cli-core";
import {DIContext, injector, logger, runInContext, type TokenProvider} from "@tsed/di";
import {v4} from "uuid";

export type PromptProps = Parameters<McpServer["registerPrompt"]>[1] & {
  token?: TokenProvider;
  name: string;
  handler: PromptCallback;
};

/**
 * Prompts are reusable templates that help humans prompt models to interact with your server.
 * They're designed to be user-driven, and might appear as slash commands in a chat interface.
 *
 * ```ts
 * import {definePrompt} from "@tsed/cli-mcp";
 *
 * export default definePrompt({
 *   name: "review-code",
 *   title: 'Code review',
 *   description: 'Review code for best practices and potential issues',
 *   argsSchema: { code: z.string() }
 *   handler: ({ code }) => ({
 *     messages: [
 *       {
 *         role: 'user',
 *         content: {
 *           type: 'text',
 *           text: `Please review this code:\n\n${code}`
 *         }
 *       }
 *     ]
 *   })
 * });
 * ```
 *
 * @param options {PromptProps}
 */
export function definePrompt(options: PromptProps) {
  const provider = injectable(options.token || Symbol.for(`MCP:RESOURCE:${options.name}`))
    .type("CLI_MCP_RESOURCES")
    .factory(() => ({
      ...options,
      async handler(...args: any[]) {
        const $ctx = new DIContext({
          id: v4(),
          injector: injector(),
          logger: logger(),
          level: logger().level,
          maxStackSize: 0,
          platform: "MCP"
        });

        return runInContext($ctx, () => {
          return (options.handler as any)(...args);
        });
      }
    }));

  return provider.token();
}
