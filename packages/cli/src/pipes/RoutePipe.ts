import {Injectable} from "@tsed/cli-core";
import {paramCase} from "change-case";

@Injectable()
export class RoutePipe {
  transform(route: string) {
    return `/${route
      .split("/")
      .map(v => paramCase(v))
      .join("/")}`.replace(/\/\//gi, "/");
  }
}
