import {describe, it, expect} from "vitest";
import modelTemplate from "./model.template.js";

describe("modelTemplate", () => {
  it("should render model template correctly", () => {
    const result = modelTemplate.render("User", {} as any);

    expect(result).toContain('import {Property} from "@tsed/schema"');
    expect(result).toContain("export class User {");
    expect(result).toContain("@Property()");
    expect(result).toContain("id: string;");
  });
});
