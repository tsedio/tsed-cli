import {Module} from "@tsed/di";
import {InitExpressPlatform} from "./supports/InitExpressPlatform";
import {InitKoaPlatform} from "./supports/InitKoaPlatform";
import {InitBasePlatform} from "./supports/InitBasePlatform";
import {Inject} from "@tsed/cli-core";

@Module({
  imports: [InitExpressPlatform, InitKoaPlatform]
})
export class InitPlatformsModule {
  constructor(@Inject("platform:init") private platforms: InitBasePlatform[]) {}
  get(name: string) {
    return this.platforms.find((platform) => platform.name === name)!;
  }
}
