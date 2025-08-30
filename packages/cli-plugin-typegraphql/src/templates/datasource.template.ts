import {defineTemplate} from "@tsed/cli";

export default defineTemplate({
  id: "typegraphql.datasource",
  label: "TypeGraphQL DataSource",
  fileName: "{{symbolName}}.datasource",
  outputDir: "{{srcDir}}/graphql/datasources",

  render(symbolName: string) {
    return `import {DataSourceService} from "@tsed/typegraphql";
import {RESTDataSource} from "apollo-datasource-rest";

@DataSourceService()
export class ${symbolName} extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "http://localhost:8001";
  }

  willSendRequest(request: any) {
    request.headers.set("Authorization", this.context.token);
  }

  getMyData(id: string) {
    return this.get(\`/rest/calendars/\${id}\`);
  }
}`;
  }
});
