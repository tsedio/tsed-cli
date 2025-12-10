import {ProjectPackageJson} from "@tsed/cli-core";
import {defineResource} from "@tsed/cli-mcp";
import {constant, inject} from "@tsed/di";

async function getMcpVersion() {
  try {
    // best effort: resolve MCP SDK version via package.json resolution
    const mcpPkg = await import("@modelcontextprotocol/sdk/package.json", {with: {type: "json"}} as any).catch(() => undefined);
    return (mcpPkg as any)?.version;
  } catch {
    // ignore
  }
}

export const serverInfoResource = defineResource({
  name: "server-info",
  uri: "tsed://server/info",
  title: "Server information",
  description: "Process and environment information for the Ts.ED MCP server.",
  mimeType: "application/json",
  async handler(uri) {
    const projectPackage = inject(ProjectPackageJson);

    const info = {
      pid: process.pid,
      serverCwd: process.cwd(),
      projectCwd: inject(ProjectPackageJson).cwd,
      tsedCliVersion: constant<string>("version"),
      mcpSdkVersion: await getMcpVersion(),
      projectExists: !!projectPackage.preferences?.packageManager
    };

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(info, null, 2)
        }
      ]
    };
  }
});
