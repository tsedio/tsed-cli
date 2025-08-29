import {describe, it, expect} from "vitest";
import moduleTemplate from "./module.template.js";

describe("moduleTemplate", () => {
  it("should render module template correctly", () => {
    const result = moduleTemplate.render("UsersModule", {} as any);

    expect(result).toContain('import {Module} from "@tsed/di"');
    expect(result).toContain("@Module()");
    expect(result).toContain("export class UsersModule {");
  });
});
