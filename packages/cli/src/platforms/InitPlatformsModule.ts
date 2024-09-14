import {Inject} from "@tsed/cli-core";
import {Module} from "@tsed/di";

import {InitBasePlatform} from "./supports/InitBasePlatform";
import {InitExpressPlatform} from "./supports/InitExpressPlatform";
import {InitKoaPlatform} from "./supports/InitKoaPlatform";

@Module({
  imports: [InitExpressPlatform, InitKoaPlatform]
})
export class InitPlatformsModule {
  constructor(@Inject("platform:init") private platforms: InitBasePlatform[]) {}
  get(name: string) {
    return this.platforms.find((platform) => platform.name === name)!;
  }
}
