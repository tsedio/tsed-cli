import {injectable} from "@tsed/cli-core";
import {kebabCase} from "change-case";

export class RoutePipe {
  transform(route: string) {
    const r = route
      .split("/")
      .reduce((paths: string[], path) => {
        const word = kebabCase(path);

        if (paths.includes(`${word}s`) || paths.includes(word)) {
          return paths;
        }

        return [...paths, kebabCase(path)];
      }, [])
      .join("/");

    return `/${r}`.replace(/\/\//gi, "/");
  }
}

injectable(RoutePipe);
