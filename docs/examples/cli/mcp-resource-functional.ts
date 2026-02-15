import {defineResource} from "@tsed/cli-mcp";

export const changelogResource = defineResource({
  name: "changelog",
  uri: "changelog://latest",
  title: "Latest CLI releases",
  description: "Surface Ts.ED CLI release notes to MCP clients.",
  mimeType: "text/markdown",
  async handler() {
    return {
      contents: [
        {
          uri: "changelog://latest",
          text: "- feat: interactive CLI docs available at https://cli.tsed.dev/guide/cli/overview"
        }
      ]
    };
  }
});
