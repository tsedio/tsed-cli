import type {CliCore} from "../CliCore";

export class CliError extends Error {
  name = "CLI_ERROR";

  readonly cli: CliCore;
  readonly origin: Error;

  constructor({cli, origin}: {cli: CliCore; origin: Error}) {
    super(origin.message);
    this.cli = cli;
    this.origin = origin;
    this.stack = origin.stack;
  }
}
