import "./McpServerFactory.js";

import {createInjector, loadPlugins} from "@tsed/cli-core";
import {constant, inject, injector} from "@tsed/di";
import {$asyncEmit} from "@tsed/hooks";

import {MCP_SERVER} from "./McpServerFactory.js";

export class CLIMCPServer {
  protected constructor(settings: Partial<TsED.Configuration>) {
    createInjector(settings);
  }

  static async bootstrap(settings: Partial<TsED.Configuration>) {
    const server = new CLIMCPServer({
      ...settings,
      name: settings.name || "tsed",
      project: {
        srcDir: "src",
        scriptsDir: "scripts",
        ...(settings.project || {})
      }
    });

    return server.bootstrap();
  }

  async bootstrap() {
    constant("plugins") && (await loadPlugins());

    await $asyncEmit("$beforeInit");

    await injector().load();
    await $asyncEmit("$afterInit");

    injector().settings.set("loaded", true);

    await $asyncEmit("$onReady");

    await inject(MCP_SERVER).connect();
  }
}
