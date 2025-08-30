import {defineTemplate} from "@tsed/cli";

export default defineTemplate({
  id: "typegraphql.model",
  label: "TypeGraphQL Model",
  fileName: "{{symbolName}}.model",
  outputDir: "{{srcDir}}/graphql/models",

  render(symbolName: string) {
    return `import {Field, ID, ObjectType} from "type-graphql";

@ObjectType({description: "Object representing cooking ${symbolName}"})
export class ${symbolName} {
  @Field((type) => ID)
  id: string;

  constructor(options: Partial<${symbolName}> = {}) {
    options.id && (this.id = options.id);
  }
}
`;
  }
});
