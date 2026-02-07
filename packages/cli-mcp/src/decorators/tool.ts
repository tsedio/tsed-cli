import {classOf} from "@tsed/core";

import {type ClassToolProps, defineTool} from "../fn/defineTool.js";

export function Tool<Input = any, Output = any>(name?: string, options: Partial<ClassToolProps<Input, Output>> = {}) {
  return (target: any, propertyKey: string | symbol, _: PropertyDescriptor) => {
    defineTool<Input, Output>({
      ...(options as ClassToolProps<Input, Output>),
      name: name || String(propertyKey),
      token: classOf(target),
      propertyKey
    });
  };
}
