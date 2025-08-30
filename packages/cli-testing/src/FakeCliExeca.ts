import {CliExeca} from "@tsed/cli-core";
import {$emit} from "@tsed/hooks";
import {Observable} from "rxjs";

export class FakeCliExeca extends CliExeca {
  static entries = new Map<string, string>();

  run(cmd: string, args: string[], opts?: any): any {
    const key = cmd + " " + args.join(" ");

    const result = FakeCliExeca.entries.get(key);

    if (!result) {
      FakeCliExeca.entries.set(key, "executed");
    }

    return new Observable((observer) => {
      $emit(key);
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
    const key = cmd + " " + args.join(" ");
    $emit(key);
    return Promise.resolve(FakeCliExeca.entries.get(key));
  }

  runSync(cmd: string, args: string[], opts?: any): any {
    return {
      stdout: FakeCliExeca.entries.get(cmd + " " + args.join(" "))
    };
  }
}
