import {CliHttpClient, ProjectPackageJson} from "@tsed/cli-core";
import {constant, inject, injectable} from "@tsed/di";
import * as os from "os";

declare global {
  namespace TsED {
    interface Configuration {
      stats?: {
        disabled?: boolean;
        url?: string;
      };
    }
  }
}

type InitStatPayload = {
  tsed_version: string;
  platform: string;
  convention: string;
  style: string;
  package_manager: string;
  runtime: string;
  features: string[];
  channel: string;
  cli_version: string;
  os: string;
  is_success: boolean;
  error_message?: string;
  error_name?: string;
};

export class CliStats extends CliHttpClient {
  protected disabled = constant("stats.disabled", false);
  protected host = constant("stats.url", "https://api.tsed.dev");
  protected projectPackage = inject(ProjectPackageJson);

  sendInit(opts: Partial<InitStatPayload>) {
    if (!this.disabled) {
      const data = {
        features: [],
        is_success: true,
        ...opts,
        os: os.type(),
        convention: this.projectPackage.preferences.convention === "conv_default" ? "tsed" : "angular",
        style: this.projectPackage.preferences.architecture === "arc_default" ? "tsed" : "angular",
        platform: this.projectPackage.preferences.platform,
        package_manager: this.projectPackage.preferences.packageManager,
        runtime: this.projectPackage.preferences.runtime,
        channel: opts.channel || "cli",
        cli_version: constant<string>("pkg.version", ""),
        tsed_version: this.projectPackage.dependencies["@tsed/platform-http"]
      } satisfies InitStatPayload;

      return this.post("/rest/cli/stats", {
        data
      }).catch(() => {
        return null;
      });
    }
  }

  $onFinish(data: {commandName?: string; features?: string[]}, er?: Error) {
    if (data.commandName === "init") {
      return this.sendInit({
        channel: "cli",
        is_success: !er,
        error_name: er?.name || "",
        error_message: er?.message,
        features: data.features as string[]
      });
    }
  }

  protected onSuccess(options: Record<string, unknown>): void {}

  protected onError(error: any, options: any) {}
}

injectable(CliStats);
