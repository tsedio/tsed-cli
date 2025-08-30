import {describe, it, expect} from "vitest";
import repositoryTemplate from "./repository.template.js";

describe("repositoryTemplate", () => {
  it("should render repository template correctly", () => {
    const result = repositoryTemplate.render("UserRepository", {} as any);

    expect(result).toContain('import {Injectable} from "@tsed/di"');
    expect(result).toContain("@Injectable()");
    expect(result).toContain("export class UserRepository {");
  });
});
