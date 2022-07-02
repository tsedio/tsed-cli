#!/usr/bin/env node
import {Cli} from "../Cli";
import commands from "../commands";
import {ArchitectureConvention, ProjectConvention} from "../interfaces";
import {PKG, TEMPLATE_DIR} from "../constants";

Cli.bootstrap({
  name: "tsed",
  pkg: PKG,
  templateDir: TEMPLATE_DIR,
  plugins: true,
  commands,
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
}).catch(console.error);
