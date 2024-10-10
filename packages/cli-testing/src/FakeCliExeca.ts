import {CliExeca} from "@tsed/cli-core";
import {Observable} from "rxjs";

export class FakeCliExeca extends CliExeca {
  static entries = new Map<string, string>();

  run(cmd: string, args: string[], opts?: any): any {
    const result = FakeCliExeca.entries.get(cmd + " " + args.join(" "));

    return new Observable((observer) => {
      observer.next(result);
      observer.complete();
    });
  }

  getAsync(cmd: string, args: string[], opts?: any): Promise<any> {
    if (["npm"].includes(cmd) && args.includes("view")) {
      return Promise.resolve(
        JSON.stringify({
          "dist-tags": {
            latest: "1.0.0"
          }
        })
      );
    }

    return Promise.resolve(FakeCliExeca.entries.get(cmd + " " + args.join(" ")));
  }

  runSync(cmd: string, args: string[], opts?: any): any {
    return {
      stdout: FakeCliExeca.entries.get(cmd + " " + args.join(" "))
    };
  }
}
