import {describe, it, expect} from "vitest";
import interceptorTemplate from "./interceptor.template.js";

describe("interceptorTemplate", () => {
  it("should render interceptor template correctly", () => {
    const result = interceptorTemplate.render("LoggingInterceptor", {} as any);

    expect(result).toContain('import {InterceptorMethods, InterceptorContext, InterceptorMethods, Interceptor} from "@tsed/di"');
    expect(result).toContain("@Interceptor()");
    expect(result).toContain("export class LoggingInterceptor implements InterceptorMethods {");
    expect(result).toContain("async intercept(context: InterceptorContext<any>, next: InterceptorMethods)");
    expect(result).toContain("const result = await next()");
    expect(result).toContain("return result");
  });
});
