import {defineTemplate} from "../utils/defineTemplate.js";
import type {GenerateCmdContext} from "../interfaces/index.js";

export default defineTemplate({
  id: "decorator",
  label: "Decorator",
  fileName: "{{symbolName}}",
  outputDir: "{{srcDir}}/decorators",

  prompts(context: GenerateCmdContext) {
    return [
      {
        type: "list",
        name: "templateType",
        message: "What kind of decorator do you want to create?",
        when(state: any) {
          return !!(["decorator"].includes(state.type || context.type) || context.templateType);
        },
        choices: [
          {name: "Class Decorator", value: "class"},
          {name: "Generic Decorator (class, property)", value: "generic"},
          {name: "Method Decorator", value: "method"},
          {name: "Parameter Decorator", value: "param"},
          {name: "Property Decorator", value: "property"},
          {name: "Property Decorator (with @Property)", value: "prop"},
          {name: "Parameters Decorator", value: "parameters"},
          {name: "Endpoint Decorator", value: "endpoint"},
          {name: "Middleware Decorator", value: "middleware"}
        ],
        default: "class"
      }
    ];
  },
  render(symbolName: string, context: GenerateCmdContext) {
    const type = context.templateType || "class";

    switch (type) {
      case "class":
        return `
export interface ${symbolName}Options {

}

export function ${symbolName}(options: ${symbolName}Options): ClassDecorator {
  return (target: any): any => {
    return class extends target {
      constructor(...args: any[]) {
        super(...args);
      }
    };
  };
}
`;

      case "generic":
        return `import {DecoratorTypes, UnsupportedDecoratorType, decoratorTypeOf} from "@tsed/core";

export interface ${symbolName}Options {

}

export function ${symbolName}(options: ${symbolName}Options): any {
  return (...args: DecoratorParameters): any => {
    switch(decoratorTypeOf(args)) {
      case DecoratorTypes.CLASS:
      case DecoratorTypes.PROP:
        console.log("do something")
        break;

      default:
        throw new UnsupportedDecoratorType(${symbolName}, args);
    }
  };
}
`;

      case "method":
        return `
export interface ${symbolName}Options {

}

export function ${symbolName}(options: ${symbolName}Options): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> | void => {
    console.log("do something");
    return descriptor;
  };
}
`;

      case "param":
        return `import {ParamTypes, useDecorators} from "@tsed/core";
import {UsePipe} from "@tsed/platform-params";

export interface ${symbolName}Options {

}

export function ${symbolName}(options: ${symbolName}Options): ParameterDecorator {
  return useDecorators(
    UsePipe(${symbolName}Pipe),
    ParamTypes("${symbolName.toLowerCase()}")
  );
}
`;

      case "property":
        return `
export function ${symbolName}(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    console.log("do something");
  };
}
`;

      case "prop":
        return `import {useDecorators} from "@tsed/core";
import {Property} from "@tsed/schema";

export interface ${symbolName}Options {

}

export function ${symbolName}(options: ${symbolName}Options = {}): PropertyDecorator {
  return useDecorators(
    Property()
  );
}
`;

      case "parameters":
        return `
export interface ${symbolName}Options {

}

export function ${symbolName}(options: ${symbolName}Options): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number): void => {
    console.log("do something");
  };
}
`;

      case "endpoint":
        return `import {useDecorators} from "@tsed/core";
import {Get} from "@tsed/schema";

export interface ${symbolName}Options {

}

export function ${symbolName}(options: ${symbolName}Options = {}): MethodDecorator {
  return useDecorators(
    Get("/")
  );
}
`;

      case "middleware":
        return `import {Context} from "@tsed/platform-params";
import {Middleware, MiddlewareMethods} from "@tsed/platform-middlewares";
import {Next} from "@tsed/common";

export interface ${symbolName}Options {

}

export function ${symbolName}(options: ${symbolName}Options = {}): ClassDecorator {
  return (target: any) => {
    @Middleware()
    class ${symbolName}Middleware implements MiddlewareMethods {
      use(@Context() ctx: Context, @Next() next: Next) {
        // do something
        return next();
      }
    }

    return target;
  };
}
`;

      default:
        return `
export interface ${symbolName}Options {

}

export function ${symbolName}(options: ${symbolName}Options): any {
  return (...args: any[]): any => {
    console.log("do something");
  };
}
`;
    }
  }
});
