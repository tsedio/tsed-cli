import {describe, expect, it, vi} from "vitest";
import controllerTemplate from "./controller.template.js";
import type {GenerateCmdContext} from "../interfaces/GenerateCmdContext.js";

// Mock dependencies
vi.mock("../pipes", () => ({
  RoutePipe: {
    transform: vi.fn().mockImplementation((val) => `/mocked-${val}`)
  }
}));

vi.mock("@tsed/di", () => ({
  inject: vi.fn().mockImplementation(() => ({
    transform: (val: string) => `/mocked-${val}`
  }))
}));

describe("controllerTemplate", () => {
  it("should render controller template correctly", () => {
    const mockContext = {
      route: "users"
    } as GenerateCmdContext;

    const result = controllerTemplate.render("UsersController", mockContext);

    expect(result).toContain('import {Controller} from "@tsed/di"');
    expect(result).toContain('import {Get} from "@tsed/schema"');
    expect(result).toContain('@Controller("/mocked-users")');
    expect(result).toContain("export class UsersController");
    expect(result).toContain('@Get("/")');
    expect(result).toContain("get()");
    expect(result).toContain('return "hello"');
  });
});
