import {defineTemplate} from "@tsed/cli";

export default defineTemplate({
  id: "typegraphql.service",
  label: "TypeGraphQL Service",
  fileName: "{{symbolName}}.service",
  outputDir: "{{srcDir}}/services",
  hidden: true,

  render(symbolName: string) {
    return `import {Injectable} from "@tsed/di";

@Injectable()
export class ${symbolName} {
  getById(id: string) {
    return null;
  }
  
  findAll(query: any) {
    return [];
  }
}
`;
  }
});
