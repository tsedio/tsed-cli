import {describe, it, expect} from "vitest";
import interfaceTemplate from "./interface.template.js";

describe("interfaceTemplate", () => {
  it("should render interface template correctly", () => {
    const result = interfaceTemplate.render("UserOptions", {} as any);

    expect(result).toContain("export interface UserOptions {");
  });
});
