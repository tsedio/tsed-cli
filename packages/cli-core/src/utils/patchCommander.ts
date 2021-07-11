import chalk from "chalk";
import {Command} from "commander";

const helpInformation = Command.prototype.helpInformation;

function colorizeSection(str: any, section: string) {
  // eslint-disable-next-line prefer-const
  let [before, after] = str.split(section);
  after = after
    .split("\n")
    .map((line: string) => {
      if (!line.match(/(\w+):$/)) {
        const [cmd, ...rest] = line.trim().split(" ");
        if (!cmd.startsWith("-")) {
          return [" ", chalk.bold(chalk.blue(cmd)), ...rest].join(" ");
        }
      }

      return line;
    })
    .join("\n");

  return [before, after].join(chalk.green(section));
}

Command.prototype.helpInformation = function help() {
  let str = helpInformation.call(this);

  if (str.includes("Commands:")) {
    str = colorizeSection(str, "Commands:");
  }

  if (str.includes("Arguments:")) {
    str = colorizeSection(str, "Arguments:");
  }

  return (
    "\n" +
    str
      .replace("Usage:", chalk.green("Usage:"))
      .replace("Options:", chalk.green("Options:"))
      .replace(/<(\w+)>/gi, `<${chalk.yellow("$1")}>`)
      .replace(/\[(\w+)]/gi, `[${chalk.cyan("$1")}]`) +
    "\n"
  );
};
