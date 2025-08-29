import {describe, it, expect} from "vitest";
import exceptionFilterTemplate from "./exception-filter.template.js";

describe("exceptionFilterTemplate", () => {
  it("should render exception filter template correctly", () => {
    const result = exceptionFilterTemplate.render("HttpException", {} as any);

    expect(result).toContain('import {BaseContext} from "@tsed/di"');
    expect(result).toContain('import {Catch, ExceptionFilterMethods} from "@tsed/platform-exceptions"');
    expect(result).toContain("@Catch(Error)");
    expect(result).toContain("export class HttpException implements ExceptionFilterMethods {");
    expect(result).toContain("catch(exception: Exception, ctx: BaseContext)");
  });
});
