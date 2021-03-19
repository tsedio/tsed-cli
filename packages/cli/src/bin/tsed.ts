#!/usr/bin/env node
import {AddCmd, Cli} from "@tsed/cli-core";
import {resolve} from "path";
import commands from "../commands";
import {ProjectConvention} from "../interfaces/ProjectConvention";

const pkg = require("../../package.json");
const TEMPLATE_DIR = resolve(__dirname, "..", "..", "templates");

async function bootstrap() {
  const cli = await Cli.bootstrap({
    name: "tsed",
    pkg,
    templateDir: TEMPLATE_DIR,
    commands: [AddCmd, ...commands],
    defaultProjectPreferences() {
      return {
        convention: ProjectConvention.DEFAULT
      };
    },
    project: {
      reinstallAfterRun: true
    }
  });

  cli.parseArgs();
}

bootstrap();
