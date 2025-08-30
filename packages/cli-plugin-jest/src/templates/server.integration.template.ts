import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";

export default defineTemplate({
  id: "server.integration",
  label: "Server Integration Test",
  outputDir: "{{srcDir}}",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    return `import { PlatformTest } from "@tsed/platform-http/testing";
import SuperTest from "supertest";
import { ${symbolName} } from "./${data.symbolPathBasename}.js";

describe("${symbolName}", () => {
  beforeAll(PlatformTest.bootstrap(${symbolName}));
  afterAll(PlatformTest.reset);

  it("should call GET ${data.route}", async () => {
     const request = SuperTest(PlatformTest.callback());
     const response = await request.get("${data.route}").expect(404);

     expect(response.body).toEqual({
       errors: [],
       message: 'Resource "/rest" not found',
       name: "NOT_FOUND",
       status: 404,
     });
  });
});
`;
  }
});
