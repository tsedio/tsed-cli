import {describe, it, expect} from "vitest";
import serviceTemplate from "./service.template.js";

describe("serviceTemplate", () => {
  it("should render service template correctly", () => {
    const result = serviceTemplate.render("UserService", {} as any);

    expect(result).toContain('import {Injectable} from "@tsed/di"');
    expect(result).toContain("@Injectable()");
    expect(result).toContain("export class UserService {");
  });
});
