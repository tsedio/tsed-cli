import type {ReadResourceCallback, ResourceMetadata, ResourceTemplate} from "@modelcontextprotocol/sdk/server/mcp.js";
import {inject, injectable, type TokenProvider} from "@tsed/di";
import {JsonEntityStore} from "@tsed/schema";

import {MCP_PROVIDER_TYPES} from "../constants/constants.js";

type ResourceBaseProps = ResourceMetadata & {
  name: string;
  handler: ReadResourceCallback;
  token?: TokenProvider;
  propertyKey?: string | symbol;
};

type ResourceReadProps = ResourceBaseProps & {
  uri: string;
};

type ResourceTemplateProps = ResourceBaseProps & {
  template: ResourceTemplate;
};

export type ResourceProps = ResourceReadProps | ResourceTemplateProps;

function mapOptions(options: ResourceProps) {
  let handler: ReadResourceCallback;

  if ("propertyKey" in options && options.propertyKey) {
    const {token, propertyKey} = options;

    handler = (...args: any[]) => {
      const instance = inject(options.token) as any;
      return instance[propertyKey](...args);
    };

    const methodStore = JsonEntityStore.fromMethod(token, propertyKey);
    options.description = options.description || methodStore.operation.get("description");
    options.title = options.title || methodStore.schema.get("title");
  } else {
    handler = options.handler!;
  }

  return {
    ...options,
    handler
  };
}

export function defineResource(options: ResourceReadProps): TokenProvider;
export function defineResource(options: ResourceTemplateProps): TokenProvider;
export function defineResource(options: ResourceProps): TokenProvider {
  const provider = injectable(Symbol.for(`MCP:RESOURCE:${options.name}`))
    .type(MCP_PROVIDER_TYPES.RESOURCE)
    .factory(() => {
      return mapOptions(options);
    });

  return provider.token();
}
