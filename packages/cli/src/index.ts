import {Cli} from "@tsed/cli-core";
import {resolve} from "path";
import commands from "./commands";

export * from "./commands/create/CreateProjectCmd";
export * from "./commands/generate/GenerateCmd";

const pkg = require("../package.json");
const TEMPLATE_DIR = resolve(__dirname, "..", "templates");

export function bootstrap() {
  return Cli.bootstrap({
    name: "tsed",
    pkg,
    templateDir: TEMPLATE_DIR,
    commands
  });
}
