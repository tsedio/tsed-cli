import {ICommandArg} from "../interfaces/ICommandParameters";

export function mapArgsDescription(args: {[key: string]: ICommandArg}) {
  return Object.entries(args).reduce(
    (argsDescriptions, [key, {description}]) => ({
      ...argsDescriptions,
      [key]: description
    }),
    {}
  );
}
