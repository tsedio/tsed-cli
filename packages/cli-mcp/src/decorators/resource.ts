import type {ResourceTemplate} from "@modelcontextprotocol/sdk/server/mcp.js";
import {classOf} from "@tsed/core";
import {isString} from "@tsed/core/utils/isString.js";

import {defineResource, type ResourceProps} from "../fn/defineResource.js";

export type ResourceDecoratorOptions = Omit<ResourceProps, "handler" | "uri" | "template">;

export function Resource(uriOrTemplate: string | ResourceTemplate, options?: Partial<ResourceDecoratorOptions>) {
  return (target: any, propertyKey: string | symbol, _: PropertyDescriptor) => {
    defineResource({
      ...(options as ResourceProps),
      name: options?.name || String(propertyKey),
      token: classOf(target),
      propertyKey,
      uri: isString(uriOrTemplate) ? uriOrTemplate : undefined,
      template: !isString(uriOrTemplate) ? uriOrTemplate : undefined
    } as any);
  };
}
