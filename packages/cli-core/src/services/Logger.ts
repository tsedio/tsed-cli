import {Configuration, registerProvider} from "@tsed/di";
import {Logger} from "@tsed/logger";

registerProvider({
  provide: Logger,
  deps: [Configuration],
  useFactory(configuration: Configuration) {
    return new Logger(configuration.name);
  }
});

export {Logger};
