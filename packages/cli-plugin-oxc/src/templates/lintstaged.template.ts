import {defineTemplate, type RenderDataContext} from "@tsed/cli";

export default defineTemplate({
  id: "oxc.lintstagedrc",
  label: "OXC lint-staged configuration",
  hidden: true,
  fileName: ".lintstagedrc",
  outputDir: ".",
  preserveCase: true,
  ext: "json",
  render(_: string, data: RenderDataContext) {
    const config: Record<string, string[]> = {
      "**/*.{ts,js}": ["oxlint --fix"]
    };

    if (data.oxfmt) {
      config["*"] = ["oxfmt --no-error-on-unmatched-pattern"];
    }

    return JSON.stringify(config, null, 2) + "\n";
  }
});

export const huskyGitignoreTemplate = defineTemplate({
  id: "oxc.huskyGitignore",
  label: "Husky gitignore",
  hidden: true,
  fileName: ".gitignore",
  outputDir: ".",
  preserveCase: true,
  ext: null,
  render() {
    return "*\n!.gitignore\n";
  }
});
