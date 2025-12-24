import type {Type} from "@tsed/core";
import {type FactoryTokenProvider, injectable} from "@tsed/di";
import {JsonSchema} from "@tsed/schema";

import type {CommandOptions} from "../interfaces/CommandOptions.js";
import type {CommandProvider} from "../interfaces/index.js";

type SchemaChoice = {
  label: string;
  value: string;
  checked?: ((ctx: any) => boolean) | boolean;
  items?: SchemaChoice[];
};

declare module "@tsed/schema" {
  interface JsonSchema {
    prompt(label: string): this;

    opt(value: string): this;

    when(fn: (ctx: any) => boolean): this;

    choices(value: SchemaChoice[]): this;
  }
}

JsonSchema.add("prompt", function prompt(label: string) {
  this.customKey("x-label", label);
  return this;
})
  .add("when", function when(fn: (ctx: any) => boolean) {
    this.customKey("x-when", fn);
    return this;
  })
  .add("opt", function opt(v: string) {
    this.customKey("x-opt", v);
    return this;
  })
  .add("choices", function choices(choices: SchemaChoice[]) {
    this.customKey("x-choices", choices);
    return this;
  });

export function command<Input>(options: CommandOptions<Input>) {
  if (!options.token) {
    return injectable<FactoryTokenProvider<CommandProvider<Input>>>(Symbol.for(`COMMAND_${options.name}`) as any)
      .type("command")
      .set("command", options)
      .factory(() => {
        return {
          ...options,
          $prompt: options.prompt,
          $exec: options.handler
        };
      });
  }

  return injectable<Type<CommandProvider<Input>>>(options.token).type("command").set("command", options);
}
