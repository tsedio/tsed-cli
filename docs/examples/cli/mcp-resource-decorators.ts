import {Resource} from "@tsed/cli-mcp";
import {Injectable} from "@tsed/di";

@Injectable()
export class ChangelogResource {
  @Resource("changelog://latest", {
    title: "Latest CLI releases",
    description: "Surface Ts.ED CLI release notes to MCP clients.",
    mimeType: "text/markdown"
  })
  async latest() {
    return {
      contents: [
        {
          uri: "changelog://latest",
          text: "- feat: interactive CLI docs available at https://cli.tsed.dev/guide/cli/overview"
        }
      ]
    };
  }
}
