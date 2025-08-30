import {injectMany} from "@tsed/cli-core";
import {injectable} from "@tsed/di";

import type {InitBasePlatform} from "./supports/InitBasePlatform.js";
import {InitExpressPlatform} from "./supports/InitExpressPlatform.js";
import {InitFastifyPlatform} from "./supports/InitFastifyPlatform.js";
import {InitKoaPlatform} from "./supports/InitKoaPlatform.js";

export class PlatformsModule {
  private platforms = injectMany<InitBasePlatform>("platform:init");

  get(name: string) {
    return this.platforms.find((platform) => platform.name === name)!;
  }
}

injectable(PlatformsModule).imports([InitExpressPlatform, InitKoaPlatform, InitFastifyPlatform]);
