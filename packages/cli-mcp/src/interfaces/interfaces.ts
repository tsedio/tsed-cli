import type {PlatformMcpSettings} from "@tsed/platform-mcp/cli";

interface CliMCPSettings extends PlatformMcpSettings {
  mode: "streamable-http" | "stdio";
}

declare module "@tsed/platform-mcp/cli" {
  namespace TsED {
    interface Configuration {
      mcp?: CliMCPSettings;
    }
  }
}
