import {Inject} from "@tsed/cli-core";
import {Module} from "@tsed/di";

import type {InitBasePlatform} from "./supports/InitBasePlatform.js";
import {InitExpressPlatform} from "./supports/InitExpressPlatform.js";
import {InitKoaPlatform} from "./supports/InitKoaPlatform.js";

@Module({
  imports: [InitExpressPlatform, InitKoaPlatform]
})
export class InitPlatformsModule {
  constructor(@Inject("platform:init") private platforms: InitBasePlatform[]) {}
  get(name: string) {
    return this.platforms.find((platform) => platform.name === name)!;
  }
}
