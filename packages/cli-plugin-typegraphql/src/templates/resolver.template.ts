import {defineTemplate, type GenerateCmdContext, render} from "@tsed/cli";
// @ts-ignore
import {plural} from "pluralize";
import {camelCase, pascalCase} from "change-case";
import {relative} from "path";
import {dirname} from "node:path";

export default defineTemplate({
  id: "typegraphql.resolver",
  label: "TypeGraphQL Resolver",
  fileName: "{{symbolName}}.resolver",
  outputDir: "{{srcDir}}/graphql/resolvers",

  async render(symbolName: string, data: GenerateCmdContext) {
    const modelInfo = await render("typegraphql.model", {
      name: data.name
    });

    const serviceInfo = await render("typegraphql.service", {
      name: data.name
    });

    const name = pascalCase(data.name);
    const modelName = modelInfo?.symbolName;
    const serviceName = serviceInfo?.symbolName;
    const listName = camelCase(plural(name));
    const getName = camelCase(name);
    const relativeModelPath = relative(dirname(data.symbolPath), String(modelInfo?.symbolPath));
    const relativeServicePath = relative(dirname(data.symbolPath), String(serviceInfo?.symbolPath));

    return `import {ResolverService} from "@tsed/typegraphql";
import {Arg, Query} from "type-graphql";
import {${modelName}} from "${relativeModelPath}.js";
import {${serviceName}} from "${relativeServicePath}.js";

@ResolverService(${modelName})
export class ${symbolName} {
  protected service = inject(${serviceName});
  
  @Query((returns) => ${modelName})
  async ${getName}(@Arg("id") id: string) {
    return this.service.getById(id);
  }
  
  @Query((returns) => [${modelName}], {description: "Get all items"})
  ${listName}(): Promise<${modelName}[]> {
    return this.service.findAll({});
  }
}
`;
  }
});
