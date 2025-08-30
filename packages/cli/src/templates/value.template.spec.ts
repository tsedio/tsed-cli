import {describe, it, expect} from "vitest";
import valueTemplate from "./value.template.js";

describe("valueTemplate", () => {
  it("should render value template correctly", () => {
    const result = valueTemplate.render("CONFIG", {} as any);

    expect(result).toContain('import {injectable} from "@tsed/di"');
    expect(result).toContain('export const CONFIG = injectable(Symbol.for("CONFIG")).value({}).token();');
  });
});
