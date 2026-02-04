import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "index",
  label: "Main index application file",
  description: "Create a new main index application file",
  outputDir: "{{srcDir}}",
  fileName: "index",
  hidden: true,
  preserveCase: true,

  render() {
    return `import {$log} from "@tsed/logger";
import {PlatformBuilder} from "@tsed/platform-http";

try {
  const platform = await PlatformBuilder.bootstrap(Server);

  await platform.listen();

  const close = () => {
    $log.warn('Stop server gracefully...');

    platform
      .stop()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(-1);
      });
  };

  process.on('SIGINT', close);
  process.on('SIGTERM', close);
} catch (error) {
  $log.error({event: "SERVER_BOOTSTRAP_ERROR", message: error.message, stack: error.stack});
}
`;
  }
});
