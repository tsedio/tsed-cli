import {CliExeca} from "@tsed/cli-core";
import {Observable} from "rxjs";

export class FakeCliExeca extends CliExeca {
  static entries = new Map<string, string>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run(cmd: string, args: string[], opts?: any): any {
    const result = FakeCliExeca.entries.get(cmd + " " + args.join(" "));

    return new Observable(observer => {
      observer.next(result);
      observer.complete();
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  runSync(cmd: string, args: string[], opts?: any): any {
    return {
      stdout: FakeCliExeca.entries.get(cmd + " " + args.join(" "))
    };
  }
}
