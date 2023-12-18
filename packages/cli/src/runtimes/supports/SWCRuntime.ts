import {Injectable} from "@tsed/di";
import {NodeRuntime} from "./NodeRuntime";

@Injectable({
  type: "runtime"
})
export class SWCRuntime extends NodeRuntime {
  readonly name = "swc";

  files() {
    return [...super.files(), "/init/.swcrc.hbs"];
  }

  startDev(main: string) {
    return `swc ${main} -w -s `;
  }

  compile(src: string, out: string) {
    return `swc ${src} -o ${out} -s`;
  }

  devDependencies(): Record<string, any> {
    return {
      "@swc/core": "latest",
      "@swc/cli": "latest",
      "@swc/helpers": "latest"
    };
  }
}
