#!/usr/bin/env node
import "@swc-node/register/esm-register";

import {register} from "node:module";
import {join} from "node:path";
import {pathToFileURL} from "node:url";

import type {PackageJson} from "@tsed/cli-core";

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

const {tools, commands, resources, CliCore, PKG, TEMPLATE_DIR, ArchitectureConvention, ProjectConvention} = await import("../index.js");

CliCore.bootstrap({
  name: "tsed",
  pkg: PKG as PackageJson,
  templateDir: TEMPLATE_DIR,
  plugins: true,
  updateNotifier: true,
  checkPrecondition: true,
  commands,
  tools,
  resources,
  defaultProjectPreferences() {
    return {
      convention: ProjectConvention.DEFAULT,
      architecture: ArchitectureConvention.DEFAULT
    };
  },
  project: {
    reinstallAfterRun: true
  },
  logger: {
    level: "info"
  }
}).catch((error) => {
  console.error(error);
  process.exit(-1);
});
