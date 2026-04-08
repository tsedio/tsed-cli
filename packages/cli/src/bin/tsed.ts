#!/usr/bin/env node
const EXT = process.env.CLI_MODE === "ts" ? "ts" : "js";
const [, , commandName, ...rawArgs] = process.argv;

switch (commandName) {
  case "dev":
    try {
      const {dev} = await import("./tsed-dev.js");
      await dev(rawArgs);
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
    break;
  case "build":
    try {
      const {build} = await import("./tsed-build.js");
      await build(rawArgs);
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
    break;
  default:
    await import("./ts-mode.js");
    await import(`./boot.${EXT}`);
    break;
}
