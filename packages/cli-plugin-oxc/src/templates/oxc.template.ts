import {defineTemplate, type RenderDataContext} from "@tsed/cli";

export default defineTemplate({
  id: "oxc.config",
  label: "OXC configuration",
  hidden: true,
  fileName: ".oxlintrc",
  outputDir: ".",
  preserveCase: true,
  ext: "json",
  render() {
    return `${JSON.stringify(
      {
        $schema: "./node_modules/oxlint/configuration_schema.json",
        ignorePatterns: ["coverage", "dist", "node_modules", "processes.config.js", "**/templates"],
        env: {
          node: true
        }
      },
      null,
      2
    )}\n`;
  }
});

export const oxfmtTemplate = defineTemplate({
  id: "oxfmt.config",
  label: "Oxfmt configuration",
  hidden: true,
  fileName: ".oxfmtrc",
  outputDir: ".",
  preserveCase: true,
  ext: "json",
  render(_: string, data: RenderDataContext) {
    if (!data.oxfmt) {
      return;
    }

    return `${JSON.stringify(
      {
        $schema: "./node_modules/oxfmt/configuration_schema.json",
        printWidth: 140,
        singleQuote: false,
        semi: true,
        tabWidth: 2,
        bracketSpacing: true,
        arrowParens: "always",
        trailingComma: "none",
        ignorePatterns: ["dist", "docs", "node_modules"]
      },
      null,
      2
    )}\n`;
  }
});
