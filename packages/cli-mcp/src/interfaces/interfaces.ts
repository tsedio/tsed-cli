import type {TokenProvider} from "@tsed/di";

declare global {
  namespace TsED {
    interface Configuration {
      prompts?: TokenProvider[];
      resources?: TokenProvider[];
      tools?: TokenProvider[];
    }
  }
}
