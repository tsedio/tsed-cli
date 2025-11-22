#!/usr/bin/env node
import "@swc-node/register/esm-register";

import {register} from "node:module";
import {join} from "node:path";
import {pathToFileURL} from "node:url";

import type {PackageJson} from "@tsed/cli-core";
import {CLIMCPServer} from "@tsed/cli-mcp";

const EXT = process.env.CLI_MODE === "ts" ? "ts" : "js";

register(pathToFileURL(join(import.meta.dirname, `../loaders/alias.hook.${EXT}`)), {
  parentURL: import.meta.dirname,
  data: {
    "@tsed/core": import.meta.resolve("@tsed/core"),
    "@tsed/di": import.meta.resolve("@tsed/di"),
    "@tsed/schema": import.meta.resolve("@tsed/schema"),
    "@tsed/cli-core": import.meta.resolve("@tsed/cli-core"),
    "@tsed/cli": import.meta.resolve("@tsed/cli")
  },
  transferList: []
});

const {tools, resources, PKG, TEMPLATE_DIR, ArchitectureConvention, ProjectConvention} = await import("../index.js");

CLIMCPServer.bootstrap({
  name: "tsed",
  version: PKG.version,
  pkg: PKG as PackageJson,
  templateDir: TEMPLATE_DIR,
  tools,
  resources,
  mcp: {
    mode: process.env.args?.includes("--http") || process.env.USE_MCP_HTTP ? "streamable-http" : "stdio"
  },
  defaultProjectPreferences() {
    return {
      convention: ProjectConvention.DEFAULT,
      architecture: ArchitectureConvention.DEFAULT
    };
  },
  project: {
    reinstallAfterRun: true
  }
}).catch((error) => {
  console.error(error);
  process.exit(-1);
});
