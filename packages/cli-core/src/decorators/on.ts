import {StoreMerge} from "@tsed/core";

export function On(hookName: string, name: string): MethodDecorator {
  return (target, propertyKey) => {
    StoreMerge(hookName, {
      [name]: [propertyKey]
    })(target);
  };
}
