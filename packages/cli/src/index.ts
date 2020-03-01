import {Cli} from "@tsed/cli-core";
import commands from "./commands";

const pkg = require("../package.json");

export function bootstrap() {
  return Cli.bootstrap({
    name: "tsed",
    pkg,
    templateDir: `${__dirname}/templates`,
    commands
  });
}
