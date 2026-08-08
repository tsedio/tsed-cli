import {defineTemplate, type RenderDataContext} from "@tsed/cli";

export default defineTemplate({
  id: "eslint.lintstagedrc",
  label: "ESLint lint-staged configuration",
  hidden: true,
  fileName: ".lintstagedrc",
  outputDir: ".",
  preserveCase: true,
  ext: "json",
  render(_, data: RenderDataContext) {
    const config: Record<string, string[]> = {
      "**/*.{ts,js}": ["eslint --fix"]
    };

    if (data.prettier) {
      config["**/*.{ts,js,json,md,yml,yaml}"] = ["prettier --write"];
    }

    return JSON.stringify(config, null, 2) + "\n";
  }
});
