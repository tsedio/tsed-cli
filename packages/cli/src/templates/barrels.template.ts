import {defineTemplate} from "../utils/defineTemplate.js";
import {$alter} from "@tsed/hooks";

export default defineTemplate({
  id: "barrels",
  label: "Barrels",
  description: "Create barrels files (index.ts) to simplify imports.",
  fileName: ".barrels",
  ext: "json",
  outputDir: ".",
  hidden: true,
  preserveCase: true,

  prompts() {
    return [];
  },
  render(_, context) {
    const barrels = $alter("$alterBarrels", {
      directory: ["./src/controllers/rest", (context.swagger || context.oidc) && "./src/controllers/pages"].filter(Boolean),
      exclude: ["**/__mock__", "**/__mocks__", "**/*.spec.ts"],
      delete: true
    });

    return JSON.stringify(barrels, null, 2);
  }
});
