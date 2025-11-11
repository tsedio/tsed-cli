import type {ReadResourceCallback, ResourceMetadata} from "@modelcontextprotocol/sdk/server/mcp.js";
import {injectable} from "@tsed/cli-core";
import {DIContext, injector, logger, runInContext, type TokenProvider} from "@tsed/di";
import {v4} from "uuid";

type ResourceBaseProps = ResourceMetadata & {
  token?: TokenProvider;
  name: string;
};

type ResourceReadProps = ResourceBaseProps & {
  uri: string;
  handler: ReadResourceCallback;
};

type ResourceTemplateProps = ResourceBaseProps & {
  uri: string;
  handler: ReadResourceCallback;
};

export type ResourceProps = ResourceReadProps | ResourceTemplateProps;

/**
 * Resources can also expose data to LLMs, but unlike tools shouldn't perform significant computation or have side effects.
 *
 * Resources are designed to be used in an application-driven way, meaning MCP client applications can decide how to expose them. For example, a client could expose a resource picker to the human, or could expose them to the model directly.
 *
 * ```ts
 * import {defineResource} from "@tsed/cli-mcp";
 *
 * export default defineResource({
 *   name: "config",
 *   uri: "config://app",
 *   title: 'Application Config',
 *   description: 'Application configuration data',
 *   mimeType: 'text/plain'
 *   handler(uri) {
 *     return {
 *      contents: [
 *        {
 *          uri: uri.href,
 *          text: 'App configuration here'
 *        }
 *      ]
 *   }
 * });
 * ```
 *
 * @param options
 */
export function defineResource(options: ResourceReadProps): TokenProvider;
export function defineResource(options: ResourceTemplateProps): TokenProvider;
export function defineResource(options: ResourceProps): TokenProvider {
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
