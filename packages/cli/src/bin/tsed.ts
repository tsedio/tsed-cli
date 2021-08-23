#!/usr/bin/env node
import {Cli} from "../Cli";
import commands from "../commands";
import {ProjectConvention} from "../interfaces";
import {TEMPLATE_DIR} from "../constants";

Cli.bootstrap({
  name: "tsed",
  pkg: require("../../package.json"),
  templateDir: TEMPLATE_DIR,
  plugins: true,
  commands,
  defaultProjectPreferences() {
    return {
      convention: ProjectConvention.DEFAULT
    };
  },
  project: {
    reinstallAfterRun: true
  }
}).catch(console.error);
