import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "index.command",
  label: "CLI Entry Point",
  description: "Create a new CLI entry point file",
  outputDir: "{{srcDir}}/bin",
  hidden: true,

  render() {
    return `#!/usr/bin/env node
import {CliCore} from "@tsed/cli-core";
import {config} from "@/config";

CliCore.bootstrap({
  ...config,
  commands: []
}).catch(console.error);
`;
  }
});
