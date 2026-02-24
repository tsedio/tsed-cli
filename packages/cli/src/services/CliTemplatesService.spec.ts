import {DITest} from "@tsed/di";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const hoisted = vi.hoisted(() => ({
  globby: vi.fn(),
  lazyInject: vi.fn()
}));

vi.mock("globby", () => ({
  globby: hoisted.globby
}));

vi.mock("@tsed/di", async () => {
  const actual = await vi.importActual<typeof import("@tsed/di")>("@tsed/di");

  return {
    ...actual,
    lazyInject: hoisted.lazyInject
  };
});

describe("CliTemplatesService", () => {
  const globbyMock = vi.mocked(hoisted.globby);
  const lazyInjectMock = vi.mocked(hoisted.lazyInject);

  beforeEach(() => {
    return DITest.create({
      project: {
        rootDir: "/project",
        srcDir: "src"
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    return DITest.reset();
  });

  it("should ignore undefined custom templates and label loaded ones", async () => {
    const {CliTemplatesService} = await import("./CliTemplatesService.js");

    const template = {
      id: "feature",
      label: "Feature",
      render: vi.fn()
    };

    globbyMock.mockResolvedValue(["feature.ts", "missing.ts"]);
    lazyInjectMock.mockResolvedValueOnce(template).mockResolvedValueOnce(undefined as any);

    const service = await DITest.invoke(CliTemplatesService);

    await service.loadTemplates();

    const templates = service.getAll();

    expect(globbyMock).toHaveBeenCalledWith("**/*.ts", {
      cwd: "/project/.templates"
    });
    expect(lazyInjectMock).toHaveBeenCalledTimes(2);
    expect(templates).toEqual([
      expect.objectContaining({
        id: "feature",
        label: "Feature (custom)"
      })
    ]);
  });
});
