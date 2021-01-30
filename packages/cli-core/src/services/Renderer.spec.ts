import {SrcRendererService} from "@tsed/cli-core";
import {normalizePath} from "@tsed/cli-testing";

describe("Renderer", () => {
  it("relativeFrom()", () => {
    const service = new SrcRendererService();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    service.configuration = {
      project: {
        rootDir: "/home",
        srcDir: "/src"
      }
    };

    expect(service.relativeFrom("/controller/users.spec.ts")).toEqual("..");
    expect(normalizePath(service.relativeFrom("/controller/users/users.spec.ts"))).toEqual("../..");
  });
});
