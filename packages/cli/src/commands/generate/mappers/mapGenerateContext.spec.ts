import {ProjectPackageJson} from "@tsed/cli-core";
import * as normalizePathModule from "@tsed/normalize-path";
import {vi} from "vitest";

import {ProjectConvention} from "../../../interfaces/ProjectConvention.js";
import {OutputFilePathPipe} from "../../../pipes/OutputFilePathPipe.js";
import {SymbolNamePipe} from "../../../pipes/SymbolNamePipe.js";
import {mapGenerateContext} from "./mapGenerateContext.js";

// Mock normalizePath
vi.mock("@tsed/normalize-path", () => {
  return {
    normalizePath: vi.fn((path) => path.replace(/\\/g, "/"))
  };
});

vi.mock("@tsed/cli-core", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    inject: (token: any) => {
      if (token === SymbolNamePipe) {
        return mockClassNamePipe;
      }
      if (token === OutputFilePathPipe) {
        return mockOutputFilePathPipe;
      }
      if (token === ProjectPackageJson) {
        return mockProjectPackageJson;
      }
      return token;
    }
  };
});

const mockClassNamePipe = {
  transform: vi.fn()
};

const mockOutputFilePathPipe = {
  transform: vi.fn()
};

const mockProjectPackageJson = {
  fillWithPreferences: vi.fn().mockImplementation((ctx) => ({...ctx, srcDir: "src"}))
};

describe("mapGenerateContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should map context with default values when minimal input is provided", () => {
    // Setup
    mockClassNamePipe.transform.mockImplementation(({name, type}) => {
      return `${name}${type ? type.charAt(0).toUpperCase() + type.slice(1) : ""}`;
    });
    mockOutputFilePathPipe.transform.mockReturnValue("path/to/file");

    // Execute
    const result = mapGenerateContext({});

    // Verify
    expect(mockClassNamePipe.transform).toHaveBeenCalledWith({
      name: "",
      type: "",
      format: ProjectConvention.DEFAULT
    });
    expect(mockOutputFilePathPipe.transform).toHaveBeenCalledWith({
      name: "",
      type: "",
      subDir: undefined
    });
    expect(mockProjectPackageJson.fillWithPreferences).toHaveBeenCalled();
    expect(result).toEqual({
      srcDir: "src",
      type: "",
      symbolName: "",
      symbolPath: "path/to/file",
      symbolPathBasename: ""
    });
  });

  it("should map context with provided name and type", () => {
    // Setup
    mockClassNamePipe.transform
      .mockImplementationOnce(({name, type}) => `${name}${type.charAt(0).toUpperCase() + type.slice(1)}`)
      .mockImplementationOnce(({name, type}) => `${name}.${type}`);
    mockOutputFilePathPipe.transform.mockReturnValue("path/to/user/controller");

    // Execute
    const result = mapGenerateContext({
      name: "user",
      type: "controller"
    });

    // Verify
    expect(mockClassNamePipe.transform).toHaveBeenCalledWith({
      name: "user",
      type: "controller",
      format: ProjectConvention.DEFAULT
    });
    expect(mockOutputFilePathPipe.transform).toHaveBeenCalledWith({
      name: "user",
      type: "controller",
      subDir: undefined
    });
    expect(result).toEqual({
      name: "user",
      type: "controller",
      srcDir: "src",
      symbolName: "userController",
      symbolPath: "path/to/user/controller",
      symbolPathBasename: "user.controller"
    });
  });

  it("should handle prisma service special case", () => {
    // Setup
    mockClassNamePipe.transform
      .mockImplementationOnce(
        ({name, type}) =>
          `${name}${type.split(".")[0].charAt(0).toUpperCase() + type.split(".")[0].slice(1)}${
            type.split(".")[1].charAt(0).toUpperCase() + type.split(".")[1].slice(1)
          }`
      )
      .mockImplementationOnce(({name, type}) => `${name}.${type}`);
    mockOutputFilePathPipe.transform.mockReturnValue("path/to/prisma/service");

    // Execute
    const result = mapGenerateContext({
      name: "prisma",
      type: "service"
    });

    // Verify
    expect(mockClassNamePipe.transform).toHaveBeenCalledWith({
      name: "prisma",
      type: "prisma.service",
      format: ProjectConvention.DEFAULT
    });
    expect(mockOutputFilePathPipe.transform).toHaveBeenCalledWith({
      name: "prisma",
      type: "prisma.service",
      subDir: undefined
    });
    expect(result).toEqual({
      name: "prisma",
      type: "prisma.service",
      srcDir: "src",
      symbolName: "prismaPrismaService",
      symbolPath: "path/to/prisma/service",
      symbolPathBasename: "prisma.prisma.service"
    });
  });

  it("should handle custom directory", () => {
    // Setup
    mockClassNamePipe.transform
      .mockImplementationOnce(({name, type}) => `${name}${type.charAt(0).toUpperCase() + type.slice(1)}`)
      .mockImplementationOnce(({name, type}) => `${name}.${type}`);
    mockOutputFilePathPipe.transform.mockReturnValue("path/to/custom/dir/model");

    // Execute
    const result = mapGenerateContext({
      name: "user",
      type: "model",
      directory: "custom/dir"
    });

    // Verify
    expect(mockClassNamePipe.transform).toHaveBeenCalledWith({
      name: "user",
      type: "model",
      format: ProjectConvention.DEFAULT
    });
    expect(mockOutputFilePathPipe.transform).toHaveBeenCalledWith({
      name: "user",
      type: "model",
      subDir: "custom/dir"
    });
    expect(result).toEqual({
      name: "user",
      type: "model",
      directory: "custom/dir",
      srcDir: "src",
      symbolName: "userModel",
      symbolPath: "path/to/custom/dir/model",
      symbolPathBasename: "user.model"
    });
  });

  it("should normalize paths", () => {
    // Setup
    mockClassNamePipe.transform.mockImplementationOnce(() => "userService").mockImplementationOnce(() => "user.service");
    mockOutputFilePathPipe.transform.mockReturnValue("path\\to\\user\\service");

    // Execute
    const result = mapGenerateContext({
      name: "user",
      type: "service"
    });

    // Verify
    expect(result.symbolPath).toEqual("path/to/user/service");
    expect(normalizePathModule.normalizePath).toHaveBeenCalledWith("path\\to\\user\\service");
    expect(normalizePathModule.normalizePath).toHaveBeenCalledWith("user.service");
  });
});
