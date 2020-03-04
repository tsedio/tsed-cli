import {ClassNamePipe} from "@tsed/cli-core";
import {RoutePipe} from "./RoutePipe";

describe("RoutePipe", () => {
  it("should return the outputfile", () => {
    const pipe = new RoutePipe();
    pipe.transform("/test/Path-les").should.deep.eq("/test/path-les");
  });
});
