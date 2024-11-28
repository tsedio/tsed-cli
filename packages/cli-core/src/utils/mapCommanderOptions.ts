import type {Command} from "commander";

export function mapCommanderOptions(commandName: string, commands: readonly Command[]) {
  const options: any = {};

  commands.forEach((command) => {
    if (command.name() !== commandName) {
      return;
    }

    Object.entries(command.opts())
      .filter(([key]) => !key.startsWith("_") && !["commands", "options", "parent", "rawArgs", "args"].includes(key))
      .forEach(([key, value]) => {
        options[key] = value;
      });
  });

  return options;
}
