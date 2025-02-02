import {injectMany} from "@tsed/cli-core";
import {Module} from "@tsed/di";

import type {InitBasePlatform} from "./supports/InitBasePlatform.js";
import {InitExpressPlatform} from "./supports/InitExpressPlatform.js";
import {InitFastifyPlatform} from "./supports/InitFastifyPlatform.js";
import {InitKoaPlatform} from "./supports/InitKoaPlatform.js";

@Module({
  imports: [InitExpressPlatform, InitKoaPlatform, InitFastifyPlatform]
})
export class InitPlatformsModule {
  private platforms = injectMany<InitBasePlatform>("platform:init");

  get(name: string) {
    return this.platforms.find((platform) => platform.name === name)!;
  }
}
