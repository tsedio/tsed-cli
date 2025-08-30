import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "config",
  label: "Config",
  description: "Create a new config file",
  outputDir: "{{srcDir}}/config",
  fileName: "config",
  hidden: true,
  preserveCase: true,

  render() {
    return `import {readFileSync} from "node:fs";
import loggerConfig from "./logger/index.js";

const pkg = JSON.parse(readFileSync("./package.json", {encoding: "utf8"}));
/**
 * This is the shared configuration for the application
 */
export const config: Partial<TsED.Configuration> = {
  version: pkg.version,
  ajv: {
    returnsCoercedValues: true
  },
  logger: loggerConfig
};
`;
  }
});
