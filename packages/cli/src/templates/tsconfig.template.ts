import {defineTemplate} from "../utils/defineTemplate.js";
import type {RenderDataContext} from "../interfaces/RenderDataContext.js";

export default defineTemplate({
  id: "tsconfig.config.json",
  label: "TSConfig",
  description: "Create a tsconfig.json file.",
  fileName: "tsconfig",
  outputDir: ".",
  ext: "json",
  hidden: true,
  preserveCase: true,

  render(_, context: RenderDataContext) {
    const tsconfig = {
      extends: "./tsconfig.base.json",
      compilerOptions: {
        baseUrl: ".",
        noEmit: true
      },
      include: [],
      references: [
        {
          path: "./tsconfig.node.json"
        }
      ]
    };

    if (context.testing) {
      tsconfig.references?.push({
        path: "./tsconfig.test.json"
      });
    }

    return JSON.stringify(tsconfig, null, 2);
  }
});
