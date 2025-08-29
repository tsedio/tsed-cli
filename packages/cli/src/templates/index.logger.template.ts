import {defineTemplate} from "../utils/defineTemplate.js";
import {ProjectConvention, type RenderDataContext} from "../interfaces/index.js";

export default defineTemplate({
  id: "index.logger",
  label: "Logger",
  description: "Create a new logger configuration file",
  outputDir: "{{srcDir}}/config/logger",
  fileName: "index",
  preserveCase: true,

  render(_, data: RenderDataContext) {
    return `import {DILoggerOptions} from "@tsed/di";
import {$log} from "@tsed/logger";
import {isProduction} from "../utils/index.js";

if (isProduction) {
  $log.appenders.set("stdout", {
    type: "stdout",
    levels: ["info", "debug"],
    layout: {
      type: "json"
    }
  });

  $log.appenders.set("stderr", {
    levels: ["trace", "fatal", "error", "warn"],
    type: "stderr",
    layout: {
      type: "json"
    }
  });
}

export default <DILoggerOptions>{
  disableRoutesSummary: isProduction
};
`;
  }
});
