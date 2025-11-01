import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "index.command",
  label: "CLI Entry Point",
  description: "Create a new CLI entry point file",
  outputDir: "{{srcDir}}/bin",
  fileName: "index",
  hidden: true,
  preserveCase: true,

  render() {
    return `#!/usr/bin/env node
import {CliCore} from "@tsed/cli-core";
import {config} from "@/config/config.js";
import * commands from "@/bin/commands/index.js";

CliCore.bootstrap({
  ...config,
  commands: [...Object.values(commands)]
}).catch(console.error);
`;
  }
});
