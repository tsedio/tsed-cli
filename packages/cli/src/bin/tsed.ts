#!/usr/bin/env node
import {resolve} from "path";
import {Cli} from "../Cli";
import commands from "../commands";
import {ProjectConvention} from "../interfaces";

Cli.bootstrap({
  name: "tsed",
  pkg: require("../../package.json"),
  templateDir: resolve(__dirname, "..", "..", "templates"),
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
