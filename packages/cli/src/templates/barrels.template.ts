import {defineTemplate} from "../utils/defineTemplate.js";
import {$alter} from "@tsed/hooks";

export default defineTemplate({
  id: "barrels",
  label: "Barrels",
  description: "Create barrels files (index.ts) to simplify imports.",
  fileName: ".barrels",
  ext: "json",
  outputDir: ".",
  preserveCase: true,
  prompts() {
    return [];
  },
  render(_, data) {
    const barrels = $alter("$alterBarrels", {
      directory: ["./src/controllers/rest", (data.swagger || data.oidc) && "./src/controllers/pages"].filter(Boolean),
      exclude: ["**/__mock__", "**/__mocks__", "**/*.spec.ts"],
      delete: true
    });

    return JSON.stringify(barrels, null, 2);
  }
});
