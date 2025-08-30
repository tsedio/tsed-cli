import {describe, it, expect} from "vitest";
import pipeTemplate from "./pipe.template.js";

describe("pipeTemplate", () => {
  it("should render pipe template correctly", () => {
    const result = pipeTemplate.render("ValidationPipe", {} as any);

    expect(result).toContain('import {Injectable} from "@tsed/di"');
    expect(result).toContain('import {PipeMethods, ParamMetadata} from "@tsed/platform-params"');
    expect(result).toContain("@Injectable()");
    expect(result).toContain("export class ValidationPipe extends PipeMethods {");
    expect(result).toContain("transform(value: any, param: ParamMetadata)");
    expect(result).toContain("return null");
  });
});
