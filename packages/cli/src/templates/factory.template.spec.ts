import {describe, it, expect} from "vitest";
import factoryTemplate from "./factory.template.js";

describe("factoryTemplate", () => {
  it("should render factory template correctly", () => {
    const result = factoryTemplate.render("ConfigFactory", {} as any);

    expect(result).toContain('import {injectable} from "@tsed/di"');
    expect(result).toContain("interface ConfigFactoryOptions {");
    expect(result).toContain("declare global {");
    expect(result).toContain("namespace TsED {");
    expect(result).toContain("interface Configuration extends Record<string, any> {");
    expect(result).toContain("configFactory: Options;");
    expect(result).toContain('export const ConfigFactory = injectable(Symbol.for("ConfigFactory"))');
    expect(result).toContain(".factory(() => {");
    expect(result).toContain('const myConstant = constant<ConfigFactoryOptions>("configFactory");');
    expect(result).toContain("return {};");
    expect(result).toContain(".token();");
    expect(result).toContain("export type ConfigFactory = typeof ConfigFactory;");
  });
});
