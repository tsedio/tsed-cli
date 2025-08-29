import {CliProjectService, defineTemplate, type GenerateCmdContext} from "@tsed/cli";
import {inject} from "@tsed/cli-core";

export default defineTemplate({
  id: "controller.integration",
  label: "Generic Integration Test",
  fileName: "{{symbolName}}.spec",
  outputDir: "{{srcDir}}",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    const projectService = inject(CliProjectService);
    const relativePath = projectService.getRelativePath(`${data.symbolPath}.integration.spec.ts`);
    const serverName = projectService.getServerFileName();

    return `import { expect, describe, it, afterAll, beforeAll } from "vitest";
import { PlatformTest } from "@tsed/platform-http/testing";
import SuperTest from "supertest";
import { ${symbolName} } from "./${data.symbolPathBasename}.js";
import { Server } from "${relativePath}/${serverName}.js";

describe("${symbolName}", () => {
  beforeAll(PlatformTest.bootstrap(Server, {
    mount: {
      "/": [${symbolName}]
    }
  }));
  afterAll(PlatformTest.reset);

  it("should call GET ${data.route}", async () => {
     const request = SuperTest(PlatformTest.callback());
     const response = await request.get("${data.route}").expect(200);

     expect(response.text).toEqual("hello");
  });
});
`;
  }
});
