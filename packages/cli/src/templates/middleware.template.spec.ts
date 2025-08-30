import {describe, it, expect} from "vitest";
import middlewareTemplate from "./middleware.template.js";

describe("middlewareTemplate", () => {
  it("should render middleware template correctly", () => {
    const result = middlewareTemplate.render("TestMiddleware", {} as any);

    expect(result).toContain('import {Middleware, MiddlewareMethods} from "@tsed/platform-middlewares"');
    expect(result).toContain('import {Context} from "@tsed/platform-params"');
    expect(result).toContain("@Middleware()");
    expect(result).toContain("export class TestMiddleware implements MiddlewareMethods");
    expect(result).toContain("use(@Context() ctx: Context)");
  });
});
