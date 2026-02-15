import {classOf} from "@tsed/core";

import {definePrompt, type PromptProps} from "../fn/definePrompt.js";

export type PromptDecoratorOptions = Omit<PromptProps, "handler">;

export function Prompt(options?: PromptDecoratorOptions) {
  return (target: any, propertyKey: string | symbol, _: PropertyDescriptor) => {
    definePrompt({
      ...(options as PromptProps),
      name: options?.name || String(propertyKey),
      token: classOf(target),
      propertyKey: propertyKey
    });
  };
}
