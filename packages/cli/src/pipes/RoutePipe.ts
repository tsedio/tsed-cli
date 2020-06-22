import {Injectable} from "@tsed/cli-core";
import {paramCase} from "change-case";

@Injectable()
export class RoutePipe {
  transform(route: string) {
    return `/${route
      .split("/")
      .reduce((paths, path) => {
        const word = paramCase(path);

        if (path.includes(`${word}s`)) {
          return paths;
        }

        return [...paths, paramCase(path)];
      }, [])
      .join("/")}`.replace(/\/\//gi, "/");
  }
}
