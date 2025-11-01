import {URL} from "node:url";

import {inject, injectable, refValue} from "@tsed/di";
import {camelCase} from "change-case";

import {coerce} from "../utils/coerce.js";
import {CliExeca} from "./CliExeca.js";
import {ProjectPackageJson} from "./ProjectPackageJson.js";

export interface CliProxySettings {
  url: string;
  strictSsl: boolean;
}

export class CliProxyAgent {
  readonly proxySettings = refValue<CliProxySettings>("proxy", {} as never);
  protected projectPackageJson = inject(ProjectPackageJson);
  protected cliExeca = inject(CliExeca);
  protected tunnel: typeof import("tunnel");

  async $onInit() {
    this.tunnel = await import("tunnel");
  }

  hasProxy() {
    return !!this.proxySettings.value.url;
  }

  get(type: "http" | "https") {
    if (this.hasProxy()) {
      const {strictSsl = true} = this.proxySettings.value;
      const url = new URL(this.proxySettings.value.url);
      const protocol = url.protocol.replace(":", "");

      const options = {
        proxy: {
          host: url.hostname,
          port: (url.port ? +url.port : undefined) as any,
          proxyAuth: url.username && url.password ? `${url.username}:${url.password}` : undefined,
          rejectUnauthorized: strictSsl
        }
      };

      const method = camelCase([type, "over", protocol].join(" "));

      if ((this.tunnel as any)[method]) {
        return (this.tunnel as any)[method](options);
      }
    }

    return null;
  }

  async resolveProxySettings(): Promise<void> {
    const hasProxy = this.hasProxy();

    if (hasProxy) {
      return;
    }

    const result = await Promise.all([
      this.cliExeca
        .getAsync("npm", ["config", "get", "proxy"], {
          cwd: this.projectPackageJson.dir
        })
        .catch(() => ""),
      this.cliExeca
        .getAsync("npm", ["config", "get", "http-proxy"], {
          cwd: this.projectPackageJson.dir
        })
        .catch(() => ""),
      this.cliExeca
        .getAsync("npm", ["config", "get", "https-proxy"], {
          cwd: this.projectPackageJson.dir
        })
        .catch(() => ""),
      this.cliExeca
        .getAsync("npm", ["config", "get", "strict-ssl"], {
          cwd: this.projectPackageJson.dir
        })
        .catch(() => "")
    ]);

    const [proxy, httpProxy, httpsProxy, strictSsl] = result.map(coerce);
    const url = httpsProxy || httpProxy || proxy;

    if (url) {
      this.proxySettings.value = {
        url,
        strictSsl: coerce(strictSsl) !== false
      };
    }
  }
}

injectable(CliProxyAgent).configuration({
  proxy: {
    url: process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
    strictSsl: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== undefined ? process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0" : true
  }
});
