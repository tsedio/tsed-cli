import type {McpServer, PromptCallback} from "@modelcontextprotocol/sdk/server/mcp.js";
import {type AbstractType, isArrowFn, type Type} from "@tsed/core";
import {inject, injectable} from "@tsed/di";
import {JsonEntityStore, JsonSchema} from "@tsed/schema";

import {MCP_PROVIDER_TYPES} from "../constants/constants.js";
import {toZod} from "../utils/toZod.js";

type BasePromptProps<Args> = Omit<Parameters<McpServer["registerPrompt"]>[1], "argsSchema"> & {
  name: string;
  argsSchema?: Parameters<McpServer["registerPrompt"]>[1]["argsSchema"] | JsonSchema<Args> | (() => JsonSchema<Args>);
};

type FnPromptProps<Args extends undefined = any> = BasePromptProps<Args> & {
  handler: PromptCallback<Args>;
};

type ClassPromptProps<Args extends undefined = any> = BasePromptProps<Args> & {
  token: Type | AbstractType<any>;
  propertyKey: string | symbol;
};

export type PromptProps<Args extends undefined = any> = FnPromptProps<Args> | ClassPromptProps<Args>;

function mapOptions<Args extends undefined = any>(options: PromptProps<Args>) {
  let handler: PromptCallback<Args> = undefined as any;

  if ("handler" in options) {
    handler = options.handler;
  }

  if ("propertyKey" in options && options.propertyKey) {
    const {token, propertyKey} = options;

    handler = ((...args: any[]) => {
      const instance = inject(options.token) as any;
      return instance[propertyKey](...args);
    }) as unknown as PromptCallback<Args>;

    const methodStore = JsonEntityStore.fromMethod(token, propertyKey);
    options.description = options.description || methodStore.operation.get("description");
    options.title = options.title || methodStore.schema.get("title");
  }

  return {
    ...options,
    argsSchema: toZod(isArrowFn(options.argsSchema) ? options.argsSchema() : options.argsSchema),
    handler: handler
  };
}

export type PromptsSettings = ReturnType<typeof mapOptions>;

export function definePrompt<Args extends undefined = any>(options: PromptProps<Args>) {
  const provider = injectable(Symbol.for(`MCP:PROMPT:${options.name}`))
    .type(MCP_PROVIDER_TYPES.PROMPT)
    .factory(() => {
      return mapOptions<Args>(options);
    });

  return provider.token();
}
