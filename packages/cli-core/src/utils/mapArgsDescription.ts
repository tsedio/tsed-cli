import {CommandArg} from "../interfaces/CommandParameters";

export function mapArgsDescription(args: {[key: string]: CommandArg}) {
  return Object.entries(args).reduce(
    (argsDescriptions, [key, {description}]) => ({
      ...argsDescriptions,
      [key]: description
    }),
    {}
  );
}
